'use client';

import React, { useState } from 'react';
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
import { 
  initialAccounts, 
  initialContentItems, 
  initialNotifications,
  initialInteractions,
  initialJobApplications
} from '@/data/mockDashboardData';
import { 
  SocialAccount, 
  ContentItem, 
  PlatformId,
  SystemNotification,
  SocialInteraction,
  JobApplication
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');

  // Data States
  const [accounts, setAccounts] = useState<SocialAccount[]>(initialAccounts);
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContentItems);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);
  const [interactions, setInteractions] = useState<SocialInteraction[]>(initialInteractions);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(initialJobApplications);

  // Modals & Drawers
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [createPostOpen, setCreatePostOpen] = useState<boolean>(false);
  const [selectedAccountForModal, setSelectedAccountForModal] = useState<SocialAccount | null>(null);

  // Publishing & Preview modals
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [confirmPublishItem, setConfirmPublishItem] = useState<ContentItem | null>(null);

  // Computed counts
  const draftsCount = contentItems.filter((i) => i.status === 'draft').length;
  const scheduledCount = contentItems.filter((i) => i.status === 'scheduled').length;
  const publishedCount = contentItems.filter((i) => i.status === 'published').length;
  const pendingEngagementCount = interactions.filter((i) => i.status === 'pending_reply').length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Handlers
  const handleToggleAccountConnection = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
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
  };

  const handleSaveNewPost = (newPostData: Omit<ContentItem, 'id' | 'createdAt'>) => {
    const newItem: ContentItem = {
      ...newPostData,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setContentItems((prev) => [newItem, ...prev]);

    // Create success notification
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: newPostData.status === 'scheduled' ? 'Post Scheduled' : 'Draft Approved',
      message: `"${newPostData.title.slice(0, 30)}..." saved to pipeline for ${newPostData.platform.toUpperCase()}.`,
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-indigo-500 selection:text-white">
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
          systemHealth="healthy"
        />

        {/* Dashboard Body Container */}
        <main className="flex-1 p-4 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Top Quick Stats Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveTab('content')}
              className="glass-panel rounded-2xl p-4 border border-white/5 space-y-1 text-left hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Active Drafts</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-white font-mono">{draftsCount}</p>
              <p className="text-[11px] text-slate-400">Ready for review</p>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className="glass-panel rounded-2xl p-4 border border-white/5 space-y-1 text-left hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Scheduled</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-white font-mono">{scheduledCount}</p>
              <p className="text-[11px] text-amber-400">View in Calendar</p>
            </button>

            <button
              onClick={() => setActiveTab('engagement')}
              className="glass-panel rounded-2xl p-4 border border-white/5 space-y-1 text-left hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Interactions</span>
                <MessageSquare className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white font-mono">{pendingEngagementCount}</p>
              <p className="text-[11px] text-purple-300">Awaiting Reply</p>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className="glass-panel rounded-2xl p-4 border border-white/5 space-y-1 text-left hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Connected APIs</span>
                <Share2 className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white font-mono">
                {accounts.filter((a) => a.status === 'connected').length} / {accounts.length}
              </p>
              <p className="text-[11px] text-indigo-400 font-medium">Official OAuth 2.0</p>
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
              <AnalyticsNotice />

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
              onOpenCreatePost={() => setCreatePostOpen(true)}
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
                  <h2 className="text-lg font-bold text-white">Drafts & Scheduled Pipeline</h2>
                  <p className="text-xs text-slate-400">Review feed mockups, edit text, or dispatch scheduled jobs</p>
                </div>
                <button
                  onClick={() => setActiveTab('studio')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20"
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
                <h2 className="text-lg font-bold text-white">Publishing History & Audit Logs</h2>
                <p className="text-xs text-slate-400">Verifiable delivery logs and API status responses</p>
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

          {activeTab === 'accounts' && (
            <AccountStatusGrid
              accounts={accounts}
              onConnectAccount={(acc) => setSelectedAccountForModal(acc)}
            />
          )}

          {activeTab === 'settings' && (
            <div className="glass-panel rounded-2xl p-8 border border-white/5 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">AI Provider Settings</h2>
                  <p className="text-xs text-slate-400">
                    Configure Google Gemini, OpenAI, or Groq API keys. Keys are loaded from server-side environment variables.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-slate-900/80 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">Google Gemini</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Free tier: 15 RPM, 1M TPM on Gemini 1.5/2.0 Flash via Google AI Studio.
                  </p>
                  <div className="pt-2">
                    <code className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded block truncate">
                      GEMINI_API_KEY=••••••••••••
                    </code>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">Groq Cloud</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      Fast Llama 3
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Ultra-fast inference for instant hook and caption drafting.</p>
                  <div className="pt-2">
                    <code className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded block truncate">
                      GROQ_API_KEY=••••••••••••
                    </code>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">OpenAI</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      GPT-4o mini
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Standard pay-as-you-go model provider.</p>
                  <div className="pt-2">
                    <code className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2 py-1 rounded block truncate">
                      OPENAI_API_KEY=••••••••••••
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

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
        onClose={() => setCreatePostOpen(false)}
        onSavePost={handleSaveNewPost}
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
