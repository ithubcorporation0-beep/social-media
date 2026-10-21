'use client';

import React, { useState } from 'react';
import { 
  ContentItem, 
  PlatformId, 
  PostStatus 
} from '@/types/dashboard';
import { 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Search,
  Sparkles,
  Layers,
  Eye,
  Send,
  Edit3,
  RotateCcw
} from 'lucide-react';
import {
  LinkedInIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  XTwitterIcon
} from '@/components/icons/PlatformIcons';

interface ContentOverviewProps {
  items: ContentItem[];
  searchQuery: string;
  selectedPlatform: PlatformId | 'all';
  onDeleteItem: (id: string) => void;
  onOpenCreatePost: () => void;
  onClearFilters: () => void;
  onPreviewItem?: (item: ContentItem) => void;
  onEditItem?: (item: ContentItem) => void;
  onRequestPublish?: (item: ContentItem) => void;
}

export default function ContentOverview({
  items,
  searchQuery,
  selectedPlatform,
  onDeleteItem,
  onOpenCreatePost,
  onClearFilters,
  onPreviewItem,
  onEditItem,
  onRequestPublish,
}: ContentOverviewProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'scheduled' | 'published' | 'failed'>('all');

  // Filter logic based on tab, platform, and search query
  const filteredItems = items.filter((item) => {
    // Status tab filter
    if (activeFilter !== 'all' && item.status !== activeFilter) {
      return false;
    }
    // Platform filter
    if (selectedPlatform !== 'all' && item.platform !== selectedPlatform) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchBody = item.body.toLowerCase().includes(q);
      const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchBody && !matchTags) return false;
    }
    return true;
  });

  const getStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/5">
            <FileText className="w-3 h-3 text-slate-400" />
            Draft
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 text-amber-400" />
            Scheduled
          </span>
        );
      case 'publishing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
            <Send className="w-3 h-3 text-indigo-400" />
            Publishing...
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Published
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const getPlatformIcon = (platform: PlatformId) => {
    switch (platform) {
      case 'linkedin': return <LinkedInIcon className="w-3.5 h-3.5 text-blue-400" />;
      case 'facebook': return <FacebookIcon className="w-3.5 h-3.5 text-blue-500" />;
      case 'instagram': return <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />;
      case 'youtube': return <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />;
      case 'x': return <XTwitterIcon className="w-3.5 h-3.5 text-slate-300" />;
      default: return <FileText className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getPlatformLabel = (platform: PlatformId) => {
    switch (platform) {
      case 'linkedin': return 'LinkedIn';
      case 'facebook': return 'Facebook Page';
      case 'instagram': return 'Instagram';
      case 'youtube': return 'YouTube';
      case 'x': return 'X';
      case 'adzuna': return 'Adzuna';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Content Pipeline & History</span>
          </h2>
          <p className="text-xs text-slate-400">
            Preview feed mockups, edit drafts, and dispatch posts with duplicate protection.
          </p>
        </div>

        {/* Status Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 border border-white/10 rounded-xl overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Content' },
            { id: 'draft', label: 'Drafts' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'published', label: 'History' },
            { id: 'failed', label: 'Failed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Cards Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="glass-panel-interactive rounded-xl p-5 border border-white/5 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono flex items-center gap-1.5">
                      {getPlatformIcon(item.platform)}
                      <span>{getPlatformLabel(item.platform)}</span>
                    </span>
                    {item.isDemo && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                        DEMO
                      </span>
                    )}
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="font-semibold text-sm text-white line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-300 whitespace-pre-line line-clamp-3 leading-relaxed">
                  {item.body}
                </p>

                {/* Error message callout if failed */}
                {item.errorMessage && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span>{item.errorMessage}</span>
                      {onRequestPublish && (
                        <button
                          onClick={() => onRequestPublish(item)}
                          className="mt-1.5 text-[11px] text-rose-200 hover:underline font-bold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Retry Dispatch
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags and Metadata */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Timestamp and Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/5 text-xs text-slate-400">
                <div className="flex items-center gap-1 text-[11px]">
                  {item.scheduledFor ? (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Scheduled: {new Date(item.scheduledFor).toLocaleDateString()}</span>
                    </>
                  ) : item.publishedAt ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Published: {new Date(item.publishedAt).toLocaleDateString()}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.charCount} chars</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Feed Mockup Preview Trigger */}
                  {onPreviewItem && (
                    <button
                      onClick={() => onPreviewItem(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                      title="Preview Social Feed Mockup"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  {/* Edit Post Trigger */}
                  {onEditItem && (
                    <button
                      onClick={() => onEditItem(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit Post Content"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Publish Now Action (triggers confirmation modal) */}
                  {onRequestPublish && item.status !== 'published' && (
                    <button
                      onClick={() => onRequestPublish(item)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-sm flex items-center gap-1 transition-all"
                      title="Publish to Platform"
                    >
                      <Send className="w-3 h-3" />
                      <span>Publish</span>
                    </button>
                  )}

                  {item.externalUrl && (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      title="View on Platform"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Helpful Empty State */
        <div className="p-10 rounded-2xl bg-slate-900/50 border border-white/5 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <div className="max-w-sm space-y-1">
            <h3 className="text-sm font-semibold text-white">No Matching Content Found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery || selectedPlatform !== 'all' || activeFilter !== 'all'
                ? 'Try adjusting your search query, clearing your platform filter, or switching tabs.'
                : 'Your content pipeline is empty. Generate fresh captions with AI or create a draft.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(searchQuery || selectedPlatform !== 'all' || activeFilter !== 'all') && (
              <button
                onClick={onClearFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onOpenCreatePost}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate with AI Studio</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
