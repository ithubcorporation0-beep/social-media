'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  History, 
  Briefcase, 
  Share2, 
  Settings2, 
  ShieldCheck, 
  ChevronRight,
  Layers,
  MessageSquare,
  BarChart3,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  draftsCount: number;
  scheduledCount: number;
  engagementCount?: number;
  jobsCount?: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  draftsCount,
  scheduledCount,
  engagementCount = 3,
  jobsCount,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();

  const navSections = [
    {
      title: 'Core Publishing',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'studio', label: 'AI Content Studio', icon: Sparkles, badge: 'AI' },
        { id: 'calendar', label: 'Publishing Calendar', icon: Calendar, badge: 'Timeline' },
        { id: 'content', label: 'Drafts & Pipeline', icon: Layers, count: draftsCount + scheduledCount },
        { id: 'history', label: 'Publishing History', icon: History },
      ]
    },
    {
      title: 'Engagement & Growth',
      items: [
        { id: 'engagement', label: 'Engagement & Replies', icon: MessageSquare, count: engagementCount },
        { id: 'jobs', label: 'Job Tracker', icon: Briefcase, count: jobsCount },
        { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, badge: 'Audited' },
      ]
    },
    {
      title: 'System & Governance',
      items: [
        { id: 'accounts', label: 'Connected Accounts', icon: Share2 },
        { id: 'security', label: 'Security & RLS Vault', icon: ShieldCheck, badge: 'Vault' },
        { id: 'settings', label: 'AI Provider Settings', icon: Settings2 },
      ]
    }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-white/10 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Main application sidebar"
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">SocialHub</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-mono font-bold">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Socials & Job Tracker</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 lg:hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            aria-label="Close sidebar navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-mono">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
                    } focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="flex-1 text-left truncate">{item.label}</span>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {typeof item.count === 'number' && item.count > 0 && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Security & System Info Pill */}
        <div className="p-3 mx-3 mb-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-emerald-500/20 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Sandbox
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Official APIs & RLS</p>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center font-bold text-xs text-white shrink-0">
              DO
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">Demo Operator</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">demo@socialhub.local</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch theme`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
