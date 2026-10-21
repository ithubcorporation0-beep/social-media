import { NextRequest, NextResponse } from 'next/server';
import {
  schedulePost,
  getScheduledQueue,
  cancelScheduledJob,
  executeScheduledJob,
} from '@/lib/integrations/queueManager';

export async function GET() {
  try {
    const queue = getScheduledQueue();
    return NextResponse.json({
      success: true,
      count: queue.length,
      queue,
      duplicateProtection: 'Active (Idempotency Key & Mutex Lock)',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch queue' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.title || !body.body || !body.scheduledFor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: "title", "body", and "scheduledFor".',
        },
        { status: 400 }
      );
    }

    const job = schedulePost({
      contentItemId: body.contentItemId,
      title: body.title,
      body: body.body,
      platform: body.platform || 'linkedin',
      scheduledFor: body.scheduledFor,
    });

    return NextResponse.json({
      success: true,
      message: `Post successfully scheduled for ${new Date(job.scheduledFor).toLocaleString()}.`,
      job,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to schedule post.',
      },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const jobId = body?.jobId;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: "jobId".' },
        { status: 400 }
      );
    }

    const executedJob = await executeScheduledJob(jobId);

    return NextResponse.json({
      success: true,
      message: 'Scheduled post executed successfully.',
      job: executedJob,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed.' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing job ID query parameter.' },
        { status: 400 }
      );
    }

    const cancelled = cancelScheduledJob(id);

    return NextResponse.json({
      success: true,
      cancelled,
      message: cancelled
        ? 'Scheduled job cancelled and reverted to draft.'
        : 'Job not found or already executed.',
    });
  } catch (error: any) {
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel job.' },
      { status: 500 }
    );
  }
}
