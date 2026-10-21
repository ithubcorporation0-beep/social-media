export type PlatformId = 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'x' | 'tiktok' | 'adzuna';

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
  idempotencyKey?: string;
  mediaType?: 'none' | 'image' | 'video';
  mediaUrl?: string;
  retryCount?: number;
}

export interface SocialInteraction {
  id: string;
  platform: PlatformId;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  postTitle: string;
  postSnippet: string;
  commentText: string;
  timestamp: string;
  status: 'pending_reply' | 'replied' | 'ignored';
  supportedByApi: boolean;
  requiredPermission: string;
  replyText?: string;
  repliedAt?: string;
  isDemo: boolean;
}

export type ApplicationStatus = 'saved' | 'drafting' | 'applied' | 'interviewing' | 'offered' | 'rejected';

export interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  url: string;
  source: 'adzuna' | 'indeed' | 'linkedin' | 'direct';
  status: ApplicationStatus;
  createdAt: string;
  deadline?: string;
  appliedAt?: string;
  followUpDate?: string;
  interviewDate?: string;
  notes?: string;
  descriptionSnippet?: string;
  tailoredCvSummary?: string;
  coverLetter?: string;
  recruiterMessage?: string;
  isDemo: boolean;
}

export interface JobSearchResult {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  contractTime?: string;
  description: string;
  redirectUrl: string;
  source: string;
  created: string;
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

export interface PostAnalyticsItem {
  id: string;
  postId: string;
  postTitle: string;
  platform: PlatformId;
  publishedAt: string;
  impressions: number | null;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  clicks: number | null;
  engagementRate: number | null;
  status: 'verified_api' | 'partial_internal' | 'restricted_by_platform';
  statusNote?: string;
}

export type AiProviderId = 'gemini' | 'openai' | 'groq';

export interface AiProviderConfig {
  id: AiProviderId;
  name: string;
  description: string;
  defaultModel: string;
  availableModels: string[];
  isConfiguredInEnv: boolean;
  status: 'configured' | 'unconfigured' | 'testing' | 'verified' | 'error';
  lastTestedAt?: string;
  latencyMs?: number;
  errorMessage?: string;
}
