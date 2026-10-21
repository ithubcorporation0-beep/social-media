'use client';

import React from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  Filter, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { PlatformId } from '@/types/dashboard';

interface TopNavProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPlatform: PlatformId | 'all';
  setSelectedPlatform: (platform: PlatformId | 'all') => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenCreatePost: () => void;
  onOpenMobileMenu: () => void;
  systemHealth: 'healthy' | 'warning';
}

export default function TopNav({
  searchQuery,
  setSearchQuery,
  selectedPlatform,
  setSelectedPlatform,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenCreatePost,
  onOpenMobileMenu,
  systemHealth,
}: TopNavProps) {
  const platforms: { id: PlatformId | 'all'; label: string }[] = [
    { id: 'all', label: 'All Platforms' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'x', label: 'X' },
    { id: 'adzuna', label: 'Adzuna Jobs' },
  ];

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-white/5 px-4 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Search */}
      <div className="w-full sm:w-auto flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drafts, scheduled posts, job listings, or logs..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Filter, System Status, Notifications, Create Post */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {/* Platform Quick Filter */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 border border-white/10 rounded-xl">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as PlatformId | 'all')}
            className="bg-transparent text-xs text-slate-300 font-medium px-2 py-1 focus:outline-none cursor-pointer"
          >
            {platforms.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* System Health Status Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
          {systemHealth === 'healthy' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>APIs Ready</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Auth Notice</span>
            </>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-slate-950 animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Create Post Action Button */}
        <button
          onClick={onOpenCreatePost}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </button>
      </div>
    </header>
  );
}
