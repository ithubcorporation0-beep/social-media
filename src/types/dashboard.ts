export type PlatformId = 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'x' | 'adzuna';

export interface SocialAccount {
  id: string;
  platform: PlatformId;
  name: string;
  handle: string;
  accountType: 'profile' | 'page' | 'business' | 'channel' | 'api';
  status: 'connected' | 'disconnected' | 'needs_reauth';
  connectedAt?: string;
  expiresAt?: string;
  avatarUrl?: string;
  officialDocUrl: string;
  requiredScopes: string[];
}

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  platform: PlatformId;
  status: PostStatus;
  createdAt: string;
  scheduledFor?: string;
  publishedAt?: string;
  tags: string[];
  charCount: number;
  isDemo: boolean;
  externalUrl?: string;
  errorMessage?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  platform?: PlatformId;
}

export interface AnalyticsSummary {
  isConnected: boolean;
  totalImpressions: number | null;
  totalEngagement: number | null;
  totalClicks: number | null;
  activeFollowers: number | null;
  lastUpdated?: string;
  notice: string;
}
