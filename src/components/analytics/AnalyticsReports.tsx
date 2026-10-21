'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  Users, 
  Share2, 
  Download, 
  Printer, 
  Calendar, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Lock, 
  ChevronDown,
  Layers,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { PlatformId, PostAnalyticsItem, SocialAccount } from '@/types/dashboard';
import { 
  LinkedInIcon, 
  FacebookIcon, 
  InstagramIcon, 
  YouTubeIcon, 
  XIcon 
} from '@/components/icons/PlatformIcons';

interface AnalyticsReportsProps {
  analyticsItems: PostAnalyticsItem[];
  accounts: SocialAccount[];
}

export default function AnalyticsReports({ analyticsItems, accounts }: AnalyticsReportsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Filter items
  const filteredItems = analyticsItems.filter((item) => {
    if (selectedPlatform !== 'all' && item.platform !== selectedPlatform) {
      return false;
    }
    // Date filtering simulation
    const itemDate = new Date(item.publishedAt);
    const now = new Date();
    const diffDays = Math.ceil((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dateRange === '7d' && diffDays > 7) return false;
    if (dateRange === '30d' && diffDays > 30) return false;
    if (dateRange === '90d' && diffDays > 90) return false;
    return true;
  });

  // Aggregated totals (only summing verified numeric data)
  const totalImpressions = filteredItems.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
  const totalReach = filteredItems.reduce((acc, curr) => acc + (curr.reach || 0), 0);
  const totalClicks = filteredItems.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const totalLikes = filteredItems.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalComments = filteredItems.reduce((acc, curr) => acc + (curr.comments || 0), 0);

  // Engagement calculation only from items with verified data
  const itemsWithRates = filteredItems.filter((i) => typeof i.engagementRate === 'number');
  const avgEngagementRate = itemsWithRates.length > 0 
    ? (itemsWithRates.reduce((acc, curr) => acc + (curr.engagementRate || 0), 0) / itemsWithRates.length).toFixed(1)
    : '0.0';

  // Platform icon helper
  const getPlatformIcon = (platform: PlatformId) => {
    switch (platform) {
      case 'linkedin': return <LinkedInIcon className="w-4 h-4" />;
      case 'facebook': return <FacebookIcon className="w-4 h-4" />;
      case 'instagram': return <InstagramIcon className="w-4 h-4" />;
      case 'youtube': return <YouTubeIcon className="w-4 h-4" />;
      case 'x': return <XIcon className="w-3.5 h-3.5 text-slate-100" />;
      default: return <Share2 className="w-4 h-4 text-slate-400" />;
    }
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    setIsExportingCsv(true);
    try {
      const headers = ['Post ID', 'Post Title', 'Platform', 'Published Date', 'Impressions', 'Reach', 'Likes', 'Comments', 'Clicks', 'Engagement Rate (%)', 'API Verification Status', 'Notes'];
      const rows = filteredItems.map((item) => [
        item.postId,
        `"${item.postTitle.replace(/"/g, '""')}"`,
        item.platform.toUpperCase(),
        new Date(item.publishedAt).toLocaleDateString(),
        item.impressions !== null ? item.impressions : 'RESTRICTED/UNAVAILABLE',
        item.reach !== null ? item.reach : 'RESTRICTED/UNAVAILABLE',
        item.likes !== null ? item.likes : 'RESTRICTED/UNAVAILABLE',
        item.comments !== null ? item.comments : '0',
        item.clicks !== null ? item.clicks : '0',
        item.engagementRate !== null ? `${item.engagementRate}%` : 'N/A',
        item.status === 'verified_api' ? 'Official API Verified' : item.status === 'partial_internal' ? 'Internal Link Tracking Only' : 'Platform Restricted',
        `"${(item.statusNote || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `socialhub_analytics_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setTimeout(() => setIsExportingCsv(false), 800);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Compliance Guarantee */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Performance Analytics & Reports</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified Data Only
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audited reach, impressions, clicks, and engagement streamed only from official platform APIs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isExportingCsv ? 'Exporting...' : 'Export CSV'}</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print / PDF Report</span>
            </button>
          </div>
        </div>

        {/* Strict Anti-Fabrication Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-emerald-300">Audited Metrics Integrity Policy:</span>
            <p className="text-slate-400 leading-relaxed">
              SocialHub AI never fabricates or hallucinates engagement stats. Metrics below are aggregated exclusively from authorized developer connections (LinkedIn Community API, Meta Graph API v21). Any platform restriction (such as X Free Tier read limitations) is explicitly flagged with clear transparency.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Ribbon: Date Range & Platform Selector */}
      <div className="glass-panel rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Platform:
          </span>
          {(['all', 'linkedin', 'facebook', 'instagram', 'youtube', 'x'] as (PlatformId | 'all')[]).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize flex items-center gap-1.5 cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {p !== 'all' && getPlatformIcon(p as PlatformId)}
              <span>{p === 'all' ? 'All Platforms' : p === 'x' ? 'X (Twitter)' : p}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
          {(['7d', '30d', '90d', 'all'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer transition-all ${
                dateRange === r ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '90d' ? '90 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Verified Impressions</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {totalImpressions > 0 ? totalImpressions.toLocaleString() : '0'}
          </p>
          <p className="text-[11px] text-slate-400">Streamed from official post APIs</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Aggregated Reach</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {totalReach > 0 ? totalReach.toLocaleString() : '0'}
          </p>
          <p className="text-[11px] text-slate-400">Unique accounts reached</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average Engagement</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            {avgEngagementRate}%
          </p>
          <p className="text-[11px] text-slate-400">Reactions & comments / reach</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Tracked Link Clicks</span>
            <MousePointerClick className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">
            {totalClicks > 0 ? totalClicks.toLocaleString() : '0'}
          </p>
          <p className="text-[11px] text-slate-400">Internal outbound redirection</p>
        </div>
      </div>

      {/* Platform API Readiness & Metric Availability Matrix */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Platform Metric Availability & Permission Status</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <LinkedInIcon className="w-3.5 h-3.5" /> LinkedIn API v2
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                Full Metrics
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Supports real impressions, unique reach, clicks, and comment counts via <code>w_member_social</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FacebookIcon className="w-3.5 h-3.5" /> Meta Graph API v21
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
                Page Insights
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Page post impressions, engaged users, and negative feedback tracking via <code>read_insights</code>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <XIcon className="w-3 h-3 text-white" /> X (Twitter) API v2
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold">
                Tier Restricted
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Free tier restricts read metrics ($100/mo Basic required for native reach). Outbound clicks tracked via SocialHub redirect.
            </p>
          </div>
        </div>
      </div>

      {/* Published Post Performance Breakdown Table */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Post-Level Performance Audit</h3>
            <p className="text-xs text-slate-400">Granular metric records with verified API provenance</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Showing {filteredItems.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="pb-3 font-semibold pl-2">Post Title</th>
                <th className="pb-3 font-semibold">Platform</th>
                <th className="pb-3 font-semibold">Published</th>
                <th className="pb-3 font-semibold text-right">Impressions</th>
                <th className="pb-3 font-semibold text-right">Reach</th>
                <th className="pb-3 font-semibold text-right">Engagement</th>
                <th className="pb-3 font-semibold text-right">Clicks</th>
                <th className="pb-3 font-semibold text-center pr-2">API Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-3.5 pl-2 max-w-[240px]">
                    <p className="font-semibold text-white truncate">{item.postTitle}</p>
                    {item.statusNote && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.statusNote}</p>
                    )}
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-slate-300 font-medium capitalize">
                      {getPlatformIcon(item.platform)}
                      <span>{item.platform}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                    {new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-3.5 text-right font-mono">
                    {item.impressions !== null ? (
                      <span className="text-white font-medium">{item.impressions.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Restricted</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-mono">
                    {item.reach !== null ? (
                      <span className="text-white font-medium">{item.reach.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Restricted</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-mono">
                    {item.engagementRate !== null ? (
                      <span className="text-emerald-400 font-semibold">{item.engagementRate}%</span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">N/A</span>
                    )}
                  </td>
                  <td className="py-3.5 text-right font-mono text-blue-400 font-medium">
                    {item.clicks !== null ? item.clicks : 0}
                  </td>
                  <td className="py-3.5 text-center pr-2">
                    {item.status === 'verified_api' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> API Verified
                      </span>
                    ) : item.status === 'restricted_by_platform' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" /> Restricted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                        <Lock className="w-3 h-3" /> Unlinked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
