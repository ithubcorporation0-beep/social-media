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
  X
} from 'lucide-react';

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
  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'studio', label: 'AI Content Studio', icon: Sparkles, badge: 'AI' },
    { id: 'calendar', label: 'Publishing Calendar', icon: Calendar, badge: 'Timeline' },
    { id: 'engagement', label: 'Engagement & Replies', icon: MessageSquare, count: engagementCount },
    { id: 'content', label: 'Drafts & Pipeline', icon: Layers, count: draftsCount + scheduledCount },
    { id: 'history', label: 'Publishing History', icon: History },
    { id: 'jobs', label: 'Job Tracker', icon: Briefcase, count: jobsCount },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, badge: 'Audited' },
    { id: 'accounts', label: 'Connected Accounts', icon: Share2 },
    { id: 'security', label: 'Security & RLS Vault', icon: ShieldCheck, badge: 'Protected' },
    { id: 'settings', label: 'AI Provider Settings', icon: Settings2 },
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
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 glass-panel border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">SocialHub</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-medium">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Socials & Job Tracker</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Main Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="flex-1 text-left">{item.label}</span>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {typeof item.count === 'number' && item.count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Security & System Info Pill */}
        <div className="p-4 mx-4 mb-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Secure Sandbox
            </p>
            <p className="text-[11px] text-slate-400 truncate">Zero Client Secrets</p>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-white/10 flex items-center justify-center font-semibold text-sm text-white">
            DO
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Demo Operator</p>
            <p className="text-xs text-slate-400 truncate">demo@socialhub.local</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </aside>
    </>
  );
}
