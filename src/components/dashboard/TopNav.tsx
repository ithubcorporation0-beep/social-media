'use client';

import React from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Sun,
  Moon,
  Command
} from 'lucide-react';
import { PlatformId } from '@/types/dashboard';
import { useTheme } from '@/components/theme/ThemeProvider';

interface TopNavProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPlatform: PlatformId | 'all';
  setSelectedPlatform: (platform: PlatformId | 'all') => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenCreatePost: () => void;
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
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
  onOpenCommandPalette,
  systemHealth,
}: TopNavProps) {
  const { theme, toggleTheme } = useTheme();

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
    <header 
      className="sticky top-0 z-30 glass-panel border-b border-slate-200 dark:border-white/10 px-4 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors duration-200"
      role="banner"
    >
      {/* Left: Mobile Toggle & Quick Search with Command Palette trigger */}
      <div className="w-full sm:w-auto flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 group">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pipeline, posts, jobs, or press Ctrl+K..."
            aria-label="Search dashboard content"
            className="w-full pl-10 pr-20 py-2 bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium px-1"
                aria-label="Clear search input"
              >
                Clear
              </button>
            ) : (
              <button
                onClick={onOpenCommandPalette}
                className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-colors"
                title="Open Command Hub (Ctrl+K)"
                aria-label="Open Command Hub"
              >
                <Command className="w-2.5 h-2.5" />
                <span>K</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: Filter, Health, Theme Switcher, Notifications, Create Post */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
        {/* Platform Filter Dropdown */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900/80 p-1 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm">
          <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ml-2" aria-hidden="true" />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as PlatformId | 'all')}
            aria-label="Filter by social or job platform"
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 font-medium px-2 py-1 focus:outline-none cursor-pointer"
          >
            {platforms.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* System Health Status Indicator */}
        <div 
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 shadow-sm"
          title="Sandbox official API connection health"
        >
          {systemHealth === 'healthy' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="font-medium">APIs Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="font-medium">Notice</span>
            </>
          )}
        </div>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          aria-label={`Notifications (${unreadNotificationsCount} unread)`}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-slate-950 animate-pulse">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Create Post Action Button */}
        <button
          onClick={onOpenCreatePost}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Create Post</span>
        </button>
      </div>
    </header>
  );
}
