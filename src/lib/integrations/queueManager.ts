import { ContentItem, PlatformId, PostStatus } from '@/types/dashboard';
import { publishToLinkedIn } from './linkedin';
import { validatePostContent } from '@/lib/security/validator';

export interface ScheduledJob {
  id: string;
  contentItemId: string;
  title: string;
  body: string;
  platform: PlatformId;
  scheduledFor: string;
  createdAt: string;
  status: PostStatus;
  idempotencyKey: string;
  externalUrl?: string;
  errorMessage?: string;
  executedAt?: string;
  retryCount: number;
}

// In-memory persistent queue storage (simulating Upstash QStash / PostgreSQL scheduler)
const scheduledQueueStore = new Map<string, ScheduledJob>();

// Idempotency lock registry with 15-minute TTL to prevent duplicate execution
const activeLocks = new Map<string, { lockedAt: number; contentItemId: string }>();

const LOCK_TTL_MS = 15 * 60 * 1000; // 15 minutes lock window

/**
 * Attempts to acquire an exclusive lock for a publishing job using its idempotency key.
 * Prevents concurrent duplicate submissions.
 */
export function acquirePublishLock(idempotencyKey: string, contentItemId: string): boolean {
  cleanExpiredLocks();
  const existing = activeLocks.get(idempotencyKey);
  if (existing) {
    return false; // Lock already held
  }

  activeLocks.set(idempotencyKey, {
    lockedAt: Date.now(),
    contentItemId,
  });
  return true;
}

/**
 * Releases a lock upon job completion or failure.
 */
export function releasePublishLock(idempotencyKey: string): void {
  activeLocks.delete(idempotencyKey);
}

/**
 * Cleans expired lock records older than TTL.
 */
function cleanExpiredLocks(): void {
  const now = Date.now();
  for (const [key, lock] of activeLocks.entries()) {
    if (now - lock.lockedAt > LOCK_TTL_MS) {
      activeLocks.delete(key);
    }
  }
}

/**
 * Schedules a post for future automated dispatch.
 */
export function schedulePost(params: {
  contentItemId?: string;
  title: string;
  body: string;
  platform: PlatformId;
  scheduledFor: string;
}): ScheduledJob {
  const { title, body, platform, scheduledFor } = params;

  // Validate content
  const validation = validatePostContent(body, platform);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid post content.');
  }

  // Validate scheduled date
  const targetDate = new Date(scheduledFor);
  const now = new Date();
  if (isNaN(targetDate.getTime())) {
    throw new Error('Invalid scheduled date/time format.');
  }

  if (targetDate.getTime() <= now.getTime()) {
    throw new Error('Scheduled date must be in the future.');
  }

  const thirtyDaysAhead = now.getTime() + 30 * 24 * 60 * 60 * 1000;
  if (targetDate.getTime() > thirtyDaysAhead) {
    throw new Error('Posts cannot be scheduled more than 30 days in advance.');
  }

  const itemId = params.contentItemId || `item-${Date.now()}`;
  const idempotencyKey = `job_sched_${itemId}_${targetDate.getTime()}`;

  // Check if duplicate job is already scheduled
  for (const job of scheduledQueueStore.values()) {
    if (job.contentItemId === itemId && job.status === 'scheduled') {
      throw new Error('This draft is already scheduled in the publishing queue. Cancel the existing job first.');
    }
  }

  const job: ScheduledJob = {
    id: `job-${Date.now()}`,
    contentItemId: itemId,
    title,
    body: validation.sanitized || body,
    platform,
    scheduledFor: targetDate.toISOString(),
    createdAt: new Date().toISOString(),
    status: 'scheduled',
    idempotencyKey,
    retryCount: 0,
  };

  scheduledQueueStore.set(job.id, job);
  return job;
}

/**
 * Retrieves all items currently in the scheduling queue.
 */
export function getScheduledQueue(): ScheduledJob[] {
  return Array.from(scheduledQueueStore.values()).sort(
    (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );
}

/**
 * Cancels a scheduled job.
 */
export function cancelScheduledJob(jobIdOrItemId: string): boolean {
  for (const [id, job] of scheduledQueueStore.entries()) {
    if (id === jobIdOrItemId || job.contentItemId === jobIdOrItemId) {
      if (job.status === 'scheduled') {
        job.status = 'draft';
        releasePublishLock(job.idempotencyKey);
        scheduledQueueStore.delete(id);
        return true;
      }
    }
  }
  return false;
}

/**
 * Executes a scheduled job (e.g., triggered by cron or manual test dispatch).
 * Uses idempotency lock to prevent double execution.
 */
export async function executeScheduledJob(jobId: string): Promise<ScheduledJob> {
  const job = scheduledQueueStore.get(jobId);
  if (!job) {
    throw new Error(`Scheduled job not found: ${jobId}`);
  }

  if (job.status === 'published') {
    return job; // Already executed
  }

  // Acquire lock to guarantee duplicate prevention
  const lockAcquired = acquirePublishLock(job.idempotencyKey, job.contentItemId);
  if (!lockAcquired) {
    throw new Error('Duplicate execution prevented: A worker is already processing this job.');
  }

  job.status = 'publishing';

  try {
    if (job.platform === 'linkedin') {
      const result = await publishToLinkedIn({
        body: job.body,
        idempotencyKey: job.idempotencyKey,
      });

      job.status = 'published';
      job.externalUrl = result.externalUrl;
      job.executedAt = new Date().toISOString();
      job.errorMessage = undefined;
    } else {
      // Mock execution for other platforms
      job.status = 'published';
      job.externalUrl = `https://${job.platform}.com/update/${job.id}`;
      job.executedAt = new Date().toISOString();
      job.errorMessage = undefined;
    }

    return job;
  } catch (error: any) {
    job.status = 'failed';
    job.errorMessage = error.message || 'Execution failed';
    job.retryCount += 1;
    throw error;
  } finally {
    releasePublishLock(job.idempotencyKey);
  }
}
