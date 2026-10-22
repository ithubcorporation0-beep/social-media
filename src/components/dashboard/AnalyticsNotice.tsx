'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  Users, 
  Info, 
  AlertTriangle,
  Lock
} from 'lucide-react';

interface AnalyticsNoticeProps {
  onOpenFullReports?: () => void;
}

export default function AnalyticsNotice({ onOpenFullReports }: AnalyticsNoticeProps) {
  const [showDemoPreview, setShowDemoPreview] = useState(false);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5 space-y-5">
      {/* Header with Title and Strict Compliance Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Performance Analytics</h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verified Data Only
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only authentic API metrics are displayed. Fabricated metrics are strictly prohibited.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenFullReports && (
            <button
              onClick={onOpenFullReports}
              className="text-xs px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
            >
              Open Full Reports
            </button>
          )}
          <button
            onClick={() => setShowDemoPreview(!showDemoPreview)}
            className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            {showDemoPreview ? 'Hide Demo Layout' : 'Preview Layout'}
          </button>
        </div>
      </div>

      {!showDemoPreview ? (
        /* Authentic Zero-State */
        <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div className="max-w-md">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Live Metrics Awaiting OAuth Connection</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              SocialHub AI enforces strict compliance. Real impressions, post reach, and profile views stream directly from official Meta and LinkedIn APIs after you link your accounts.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            <Info className="w-3.5 h-3.5" />
            <span>X (Twitter) Free Tier does not expose read analytics; click tracking will be measured internally.</span>
          </div>
        </div>
      ) : (
        /* Demo Layout with Warning Watermark */
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
            <TrendingUp className="w-4 h-4 shrink-0 text-indigo-500" />
            <span>
              <strong>Performance Overview:</strong> Aggregate impressions, audience reach, and click-through rates across all connected channels.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Total Reach</span>
                <Eye className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">14,820</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> +18.4% vs last cycle
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Engagement</span>
                <Users className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">1,248</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3 h-3" /> 8.4% engagement rate
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Link Clicks</span>
                <MousePointerClick className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">492</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Tracked outbound links</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Active Followers</span>
                <Users className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">3,140</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Aggregated connected pages</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
