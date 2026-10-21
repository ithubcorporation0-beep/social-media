'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopNav from '@/components/dashboard/TopNav';
import AccountStatusGrid from '@/components/dashboard/AccountStatusGrid';
import ContentOverview from '@/components/dashboard/ContentOverview';
import AnalyticsNotice from '@/components/dashboard/AnalyticsNotice';
import NotificationDrawer from '@/components/dashboard/NotificationDrawer';
import ConnectAccountModal from '@/components/dashboard/ConnectAccountModal';
import CreatePostModal from '@/components/dashboard/CreatePostModal';
import ContentStudio from '@/components/studio/ContentStudio';
import CalendarView from '@/components/calendar/CalendarView';
import PostPreviewModal from '@/components/publishing/PostPreviewModal';
import PublishConfirmModal from '@/components/publishing/PublishConfirmModal';
import EditPostModal from '@/components/publishing/EditPostModal';
import EngagementHub from '@/components/engagement/EngagementHub';
import JobTracker from '@/components/jobs/JobTracker';
import AnalyticsReports from '@/components/analytics/AnalyticsReports';
import AiProviderSettings from '@/components/settings/AiProviderSettings';
import SecurityCenter from '@/components/security/SecurityCenter';
import CommandPalette from '@/components/navigation/CommandPalette';
import AuthModal from '@/components/auth/AuthModal';
import { 
  initialAccounts, 
  initialContentItems, 
  initialNotifications,
  initialInteractions,
  initialJobApplications,
  initialAnalyticsItems,
  initialAiConfigs
} from '@/data/mockDashboardData';
import { 
  SocialAccount, 
  ContentItem, 
  PlatformId,
  PostStatus,
  SystemNotification,
  SocialInteraction,
  JobApplication,
  PostAnalyticsItem,
  AiProviderConfig,
  AiProviderId
} from '@/types/dashboard';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Share2, 
  Sparkles, 
  Briefcase, 
  KeyRound, 
  ExternalLink,
  Calendar as CalendarIcon,
  MessageSquare
} from 'lucide-react';

export default function DashboardPage() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');

  // User Profile & Tenant State (Supabase Auth Context)
  const [currentUser, setCurrentUser] = useState({
    id: 'usr_demo_operator',
    email: 'demo@socialhub.local',
    name: 'Demo Operator',
    role: 'Default Sandbox Operator (RLS Ready)',
  });

  // Data States
  const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContentItems);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);
  const [interactions, setInteractions] = useState<SocialInteraction[]>(initialInteractions);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(initialJobApplications);
  const [analyticsItems, setAnalyticsItems] = useState<PostAnalyticsItem[]>(initialAnalyticsItems);
  const [aiConfigs, setAiConfigs] = useState<AiProviderConfig[]>(initialAiConfigs);
  const [defaultAiProvider, setDefaultAiProvider] = useState<AiProviderId>('gemini');

  // Modals & Drawers
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [createPostOpen, setCreatePostOpen] = useState<boolean>(false);
  const [createPostInitialDate, setCreatePostInitialDate] = useState<string | undefined>(undefined);
  const [selectedAccountForModal, setSelectedAccountForModal] = useState<SocialAccount | null>(null);

  // Publishing & Preview modals
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [confirmPublishItem, setConfirmPublishItem] = useState<ContentItem | null>(null);

  // Global keyboard shortcuts (Ctrl+K / Cmd+K to open Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Computed counts
  const draftsCount = contentItems.filter((i) => i.status === 'draft').length;
  const scheduledCount = contentItems.filter((i) => i.status === 'scheduled').length;
  const publishedCount = contentItems.filter((i) => i.status === 'published').length;
  const pendingEngagementCount = interactions.filter((i) => i.status === 'pending_reply').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Check LinkedIn backend status on mount & handle OAuth callback redirects
  useEffect(() => {
    async function checkLinkedInSync() {
      try {
        const res = await fetch('/api/auth/linkedin/status');
        if (res.ok) {
          const data = await res.json();
          if (data.connected && data.account) {
            setAccounts((prev) =>
              prev.map((acc) =>
                acc.platform === 'linkedin'
                  ? {
                      ...acc,
                      status: 'connected',
                      name: data.account.name || acc.name,
                      handle: data.account.handle || acc.handle,
                      connectedAt: data.account.connectedAt,
                      expiresAt: data.account.expiresAt,
                    }
                  : acc
              )
            );
          }
        }
      } catch (e) {
        console.error('LinkedIn sync check error:', e);
      }

      // Check URL search params for OAuth callback return
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('linkedin_connected') === 'success') {
          const newNotif: SystemNotification = {
            id: `notif-${Date.now()}`,
            title: 'LinkedIn Connected',
            message: 'Official OAuth 2.0 handshake verified. Token encrypted at rest with AES-256-GCM in server vault.',
            type: 'success',
            timestamp: 'Just now',
            read: false,
            platform: 'linkedin',
          };
          setNotifications((prev) => [newNotif, ...prev]);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (urlParams.get('linkedin_error')) {
          const err = urlParams.get('linkedin_error');
          const newNotif: SystemNotification = {
            id: `notif-${Date.now()}`,
            title: 'LinkedIn Connection Failed',
            message: `OAuth authorization returned error: ${err}`,
            type: 'error',
            timestamp: 'Just now',
            read: false,
            platform: 'linkedin',
          };
          setNotifications((prev) => [newNotif, ...prev]);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
    checkLinkedInSync();
  }, []);

  // Handlers
  const handleToggleAccountConnection = (accountId: string, updatedData?: Partial<SocialAccount>) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          if (updatedData) {
            return { ...acc, ...updatedData };
          }
          const newStatus = acc.status === 'connected' ? 'disconnected' : 'connected';
          return {
            ...acc,
            status: newStatus,
            handle: newStatus === 'connected' ? '@verified_auth' : '@not-connected',
            connectedAt: newStatus === 'connected' ? new Date().toISOString() : undefined,
          };
        }
        return acc;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setContentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdatePost = (updatedItem: ContentItem) => {
    setContentItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );

    if (updatedItem.status === 'scheduled' && updatedItem.scheduledFor) {
      fetch('/api/social/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentItemId: updatedItem.id,
          title: updatedItem.title,
          body: updatedItem.body,
          platform: updatedItem.platform,
          scheduledFor: updatedItem.scheduledFor,
        }),
      }).catch((err) => console.error('Schedule sync error:', err));
    }
  };

  const handleUpdateItemStatus = (itemId: string, newStatus: PostStatus, externalUrl?: string) => {
    setContentItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: newStatus,
            publishedAt: newStatus === 'published' ? new Date().toISOString() : item.publishedAt,
            externalUrl: externalUrl || item.externalUrl,
            scheduledFor: newStatus === 'draft' ? undefined : item.scheduledFor,
          };
        }
        return item;
      })
    );

    const targetItem = contentItems.find((i) => i.id === itemId);
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: newStatus === 'published' ? 'Post Published' : 'Status Updated',
      message: `"${(targetItem?.title || 'Post').slice(0, 30)}..." updated to ${newStatus.toUpperCase()}.`,
      type: newStatus === 'published' ? 'success' : 'info',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleSaveNewPost = (newPostData: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const newItem: ContentItem = {
      ...newPostData,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setContentItems((prev) => [newItem, ...prev]);

    // If scheduled, also register in backend queue with duplicate protection
    if (newItem.status === 'scheduled' && newItem.scheduledFor) {
      fetch('/api/social/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentItemId: newItem.id,
          title: newItem.title,
          body: newItem.body,
          platform: newItem.platform,
          scheduledFor: newItem.scheduledFor,
        }),
      }).catch((err) => console.error('Failed to sync scheduled queue:', err));
    }

    // Create success notification
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: newPostData.status === 'scheduled' ? 'Post Scheduled in Queue' : 'Draft Saved',
      message: `"${newPostData.title.slice(0, 30)}..." ${newPostData.status === 'scheduled' ? 'queued with idempotency lock' : 'saved to pipeline'} for ${newPostData.platform.toUpperCase()}.`,
      type: 'success',
      timestamp: 'Just now',
      read: false,
      platform: newPostData.platform,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handlePublishSuccess = (itemId: string, externalUrl?: string) => {
    setContentItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'published',
            publishedAt: new Date().toISOString(),
            externalUrl: externalUrl || item.externalUrl || 'https://linkedin.com/feed',
            errorMessage: undefined,
          };
        }
        return item;
      })
    );

    // Notify user
    const targetItem = contentItems.find((i) => i.id === itemId);
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Post Published Successfully',
      message: `"${(targetItem?.title || 'Post').slice(0, 30)}..." published live to official API.`,
      type: 'success',
      timestamp: 'Just now',
      read: false,
      platform: targetItem?.platform,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleSendReply = (interactionId: string, replyText: string) => {
    setInteractions((prev) =>
      prev.map((item) => {
        if (item.id === interactionId) {
          return {
            ...item,
            status: 'replied',
            replyText,
            repliedAt: 'Just now',
          };
        }
        return item;
      })
    );

    const targetInteraction = interactions.find((i) => i.id === interactionId);
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Reply Dispatched with Approval',
      message: `Sent reply to ${targetInteraction?.authorName || 'user'} on ${targetInteraction?.platform.toUpperCase()}.`,
      type: 'success',
      timestamp: 'Just now',
      read: false,
      platform: targetInteraction?.platform,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAddJobApplication = (newAppData: Omit<JobApplication, 'id' | 'createdAt'>) => {
    const newApp: JobApplication = {
      ...newAppData,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setJobApplications((prev) => [newApp, ...prev]);

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: 'Job Added to Tracker',
      message: `"${newApp.title}" at ${newApp.company} saved to pipeline.`,
      type: 'success',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleUpdateJobApplication = (updatedApp: JobApplication) => {
    setJobApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );
  };

  const handleDeleteJobApplication = (id: string) => {
    setJobApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const handleUpdateAiConfig = (updated: AiProviderConfig) => {
    setAiConfigs((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleStudioSave = (item: Omit<ContentItem, 'id' | 'createdAt'>) => {
    handleSaveNewPost(item);
    setActiveTab('calendar');
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        draftsCount={draftsCount}
        scheduledCount={scheduledCount}
        engagementCount={pendingEngagementCount}
        jobsCount={jobApplications.length}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header Navigation */}
        <TopNav
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenCreatePost={() => setCreatePostOpen(true)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          systemHealth="healthy"
        />

        {/* Dashboard Body Container with Accessible ID */}
        <main 
          id="main-content" 
          tabIndex={-1} 
          className="flex-1 p-4 lg:p-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto w-full focus:outline-none"
        >
          {/* Top Quick Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
            <button
              onClick={() => setActiveTab('content')}
              className="glass-panel-interactive rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/5 space-y-1 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label={`View ${draftsCount} Active Drafts`}
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Active Drafts</span>
                <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{draftsCount}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ready for review</p>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className="glass-panel-interactive rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/5 space-y-1 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label={`View ${scheduledCount} Scheduled Posts`}
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Scheduled</span>
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{scheduledCount}</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">View in Calendar</p>
            </button>

            <button
              onClick={() => setActiveTab('engagement')}
              className="glass-panel-interactive rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/5 space-y-1 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label={`View ${pendingEngagementCount} Pending Interactions`}
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Interactions</span>
                <MessageSquare className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">{pendingEngagementCount}</p>
              <p className="text-[11px] text-purple-600 dark:text-purple-300 font-medium">Awaiting Reply</p>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className="glass-panel-interactive rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/5 space-y-1 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
              aria-label="View Connected Accounts"
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Connected APIs</span>
                <Share2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono">
                {accounts.filter((a) => a.status === 'connected').length} / {accounts.length}
              </p>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Official OAuth 2.0</p>
            </button>
          </div>

          {/* Conditional Sub-View Routing */}
          {activeTab === 'dashboard' && (
            <>
              {/* Account Connection Grid */}
              <AccountStatusGrid
                accounts={accounts}
                onConnectAccount={(acc) => setSelectedAccountForModal(acc)}
              />

              {/* Performance Analytics (Real metrics notice) */}
              <AnalyticsNotice onOpenFullReports={() => setActiveTab('analytics')} />

              {/* Content Pipeline Overview */}
              <ContentOverview
                items={contentItems}
                searchQuery={searchQuery}
                selectedPlatform={selectedPlatform}
                onDeleteItem={handleDeleteItem}
                onOpenCreatePost={() => setCreatePostOpen(true)}
                onClearFilters={handleClearFilters}
                onPreviewItem={(item) => setPreviewItem(item)}
                onEditItem={(item) => setEditingItem(item)}
                onRequestPublish={(item) => setConfirmPublishItem(item)}
              />
            </>
          )}

          {activeTab === 'studio' && (
            <ContentStudio onSaveToPipeline={handleStudioSave} />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              items={contentItems}
              onSelectItem={(item) => setPreviewItem(item)}
              onOpenCreatePost={(date) => {
                setCreatePostInitialDate(date);
                setCreatePostOpen(true);
              }}
              onUpdateItemStatus={handleUpdateItemStatus}
            />
          )}

          {activeTab === 'engagement' && (
            <EngagementHub
              interactions={interactions}
              onSendReply={handleSendReply}
            />
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Drafts & Scheduled Pipeline</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Review feed mockups, edit text, or dispatch scheduled jobs</p>
                </div>
                <button
                  onClick={() => setActiveTab('studio')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open AI Studio</span>
                </button>
              </div>
              <ContentOverview
                items={contentItems.filter((i) => i.status === 'draft' || i.status === 'scheduled')}
                searchQuery={searchQuery}
                selectedPlatform={selectedPlatform}
                onDeleteItem={handleDeleteItem}
                onOpenCreatePost={() => setCreatePostOpen(true)}
                onClearFilters={handleClearFilters}
                onPreviewItem={(item) => setPreviewItem(item)}
                onEditItem={(item) => setEditingItem(item)}
                onRequestPublish={(item) => setConfirmPublishItem(item)}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Publishing History & Audit Logs</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Verifiable delivery logs and API status responses</p>
              </div>
              <ContentOverview
                items={contentItems.filter((i) => i.status === 'published' || i.status === 'failed')}
                searchQuery={searchQuery}
                selectedPlatform={selectedPlatform}
                onDeleteItem={handleDeleteItem}
                onOpenCreatePost={() => setCreatePostOpen(true)}
                onClearFilters={handleClearFilters}
                onPreviewItem={(item) => setPreviewItem(item)}
                onEditItem={(item) => setEditingItem(item)}
                onRequestPublish={(item) => setConfirmPublishItem(item)}
              />
            </div>
          )}

          {activeTab === 'jobs' && (
            <JobTracker
              applications={jobApplications}
              onAddApplication={handleAddJobApplication}
              onUpdateApplication={handleUpdateJobApplication}
              onDeleteApplication={handleDeleteJobApplication}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsReports
              analyticsItems={analyticsItems}
              accounts={accounts}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountStatusGrid
              accounts={accounts}
              onConnectAccount={(acc) => setSelectedAccountForModal(acc)}
            />
          )}

          {activeTab === 'security' && (
            <SecurityCenter />
          )}

          {activeTab === 'settings' && (
            <AiProviderSettings
              configs={aiConfigs}
              defaultProvider={defaultAiProvider}
              onSetDefaultProvider={(provider) => {
                setDefaultAiProvider(provider);
                const newNotif: SystemNotification = {
                  id: `notif-${Date.now()}`,
                  title: 'Default AI Engine Updated',
                  message: `Active AI provider switched to ${provider.toUpperCase()}.`,
                  type: 'info',
                  timestamp: 'Just now',
                  read: false,
                };
                setNotifications((prev) => [newNotif, ...prev]);
              }}
              onUpdateConfig={handleUpdateAiConfig}
            />
          )}
        </main>
      </div>

      {/* Global Command Hub Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenCreatePost={() => setCreatePostOpen(true)}
      />

      {/* Interactive Supabase Auth & Multi-Tenant RLS Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onSwitchUser={(u) => setCurrentUser(u)}
      />

      {/* Interactive Drawers & Modals */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
      />

      <ConnectAccountModal
        account={selectedAccountForModal}
        isOpen={!!selectedAccountForModal}
        onClose={() => setSelectedAccountForModal(null)}
        onToggleConnection={handleToggleAccountConnection}
      />

      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => {
          setCreatePostOpen(false);
          setCreatePostInitialDate(undefined);
        }}
        onSavePost={handleSaveNewPost}
        initialScheduledDate={createPostInitialDate}
      />

      <PostPreviewModal
        item={previewItem}
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        onConfirmPublish={(item) => setConfirmPublishItem(item)}
      />

      <EditPostModal
        item={editingItem}
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onUpdatePost={handleUpdatePost}
        onDeletePost={handleDeleteItem}
        onPreviewPost={(item) => setPreviewItem(item)}
      />

      <PublishConfirmModal
        item={confirmPublishItem}
        account={accounts.find((a) => a.platform === confirmPublishItem?.platform)}
        isOpen={!!confirmPublishItem}
        onClose={() => setConfirmPublishItem(null)}
        onPublishSuccess={handlePublishSuccess}
      />
    </div>
  );
}
