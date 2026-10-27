import { 
  SocialAccount, 
  ContentItem, 
  SystemNotification, 
  SocialInteraction, 
  JobApplication, 
  PostAnalyticsItem, 
  AiProviderConfig, 
  AiProviderId 
} from '@/types/dashboard';
import {
  initialAccounts,
  initialContentItems,
  initialNotifications,
  initialInteractions,
  initialJobApplications,
  initialAnalyticsItems,
  initialAiConfigs
} from '@/data/mockDashboardData';

export const STORAGE_KEYS = {
  ACCOUNTS: 'socialhub_accounts_v1',
  CONTENT: 'socialhub_content_items_v1',
  JOBS: 'socialhub_job_applications_v1',
  INTERACTIONS: 'socialhub_interactions_v1',
  NOTIFICATIONS: 'socialhub_notifications_v1',
  ANALYTICS: 'socialhub_analytics_items_v1',
  AI_CONFIGS: 'socialhub_ai_configs_v1',
  DEFAULT_AI: 'socialhub_default_ai_provider_v1',
  CURRENT_USER: 'socialhub_current_user_v1',
  WORKSPACE_MODE: 'socialhub_workspace_mode_v1', // 'custom' | 'demo'
} as const;

export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function loadStoredData<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[SocialHub Storage] Failed to parse stored item '${key}':`, err);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, data: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[SocialHub Storage] Failed to persist '${key}':`, err);
  }
}

export function clearWorkspaceToFresh(): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([
      {
        id: `notif-welcome-${Date.now()}`,
        title: 'Fresh Workspace Activated',
        message: 'Your personal workspace is ready. All posts, jobs, and accounts you create will be permanently saved on this device.',
        type: 'success',
        timestamp: 'Just now',
        read: false,
      }
    ]));
    localStorage.setItem(STORAGE_KEYS.WORKSPACE_MODE, 'custom');
  } catch (err) {
    console.error('[SocialHub Storage] Failed to clear workspace:', err);
  }
}

export function restoreDemoTemplate(): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initialAccounts));
    localStorage.setItem(STORAGE_KEYS.CONTENT, JSON.stringify(initialContentItems));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(initialJobApplications));
    localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(initialInteractions));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(initialAnalyticsItems));
    localStorage.setItem(STORAGE_KEYS.AI_CONFIGS, JSON.stringify(initialAiConfigs));
    localStorage.setItem(STORAGE_KEYS.DEFAULT_AI, JSON.stringify('gemini'));
    localStorage.setItem(STORAGE_KEYS.WORKSPACE_MODE, 'demo');
  } catch (err) {
    console.error('[SocialHub Storage] Failed to restore template:', err);
  }
}
