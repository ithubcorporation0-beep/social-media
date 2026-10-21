'use client';

import React from 'react';
import { 
  SocialAccount, 
  PlatformId 
} from '@/types/dashboard';
import { 
  Briefcase, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Plus
} from 'lucide-react';
import {
  LinkedInIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  XTwitterIcon
} from '@/components/icons/PlatformIcons';

interface AccountStatusGridProps {
  accounts: SocialAccount[];
  onConnectAccount: (account: SocialAccount) => void;
}

export default function AccountStatusGrid({ accounts, onConnectAccount }: AccountStatusGridProps) {
  const getPlatformIcon = (platform: PlatformId) => {
    switch (platform) {
      case 'linkedin':
        return <LinkedInIcon className="w-5 h-5 text-blue-500" />;
      case 'facebook':
        return <FacebookIcon className="w-5 h-5 text-blue-600" />;
      case 'instagram':
        return <InstagramIcon className="w-5 h-5 text-pink-500" />;
      case 'youtube':
        return <YouTubeIcon className="w-5 h-5 text-red-500" />;
      case 'x':
        return <XTwitterIcon className="w-5 h-5 text-slate-800 dark:text-slate-200" />;
      case 'adzuna':
        return <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const getStatusBadge = (status: SocialAccount['status']) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        );
      case 'needs_reauth':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Re-auth
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
            Not Connected
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Account Connection Status</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official OAuth 2.0 & API connections. Credentials are encrypted on the server.
          </p>
        </div>
        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{accounts.filter(a => a.status === 'connected').length}</span> of {accounts.length} active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isConnected = acc.status === 'connected';

          return (
            <div
              key={acc.id}
              className="glass-panel-interactive rounded-2xl p-5 flex flex-col justify-between border border-slate-200 dark:border-white/5"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0">
                      {getPlatformIcon(acc.platform)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{acc.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{acc.handle}</p>
                    </div>
                  </div>
                  {getStatusBadge(acc.status)}
                </div>

                <div className="space-y-1.5 my-3 py-2 border-y border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Integration Type</span>
                    <span className="text-slate-800 dark:text-slate-300 font-medium capitalize">{acc.accountType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 dark:text-slate-500">Required Scopes</span>
                    <span className="text-slate-800 dark:text-slate-300 font-mono text-[11px] truncate max-w-[160px]">
                      {acc.requiredScopes.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2">
                <a
                  href={acc.officialDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
                >
                  <span>API Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => onConnectAccount(acc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
                    isConnected
                      ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isConnected ? 'Manage OAuth' : 'Connect Account'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
