'use client';

import React from 'react';
import { SocialAccount } from '@/types/dashboard';
import { X, ShieldCheck, Key, ExternalLink, RefreshCw, Power } from 'lucide-react';

interface ConnectAccountModalProps {
  account: SocialAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleConnection: (id: string) => void;
}

export default function ConnectAccountModal({
  account,
  isOpen,
  onClose,
  onToggleConnection,
}: ConnectAccountModalProps) {
  if (!isOpen || !account) return null;

  const isConnected = account.status === 'connected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {account.name}
              </h2>
              <p className="text-xs text-slate-400">Official OAuth 2.0 Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Specs & Rules */}
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span>Required Callback URL (Redirect URI):</span>
            </div>
            <code className="block p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-indigo-300 select-all border border-indigo-500/20">
              http://localhost:3000/api/auth/callback/{account.platform}
            </code>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Requested Official Permissions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {account.requiredScopes.map((scope) => (
                <span
                  key={scope}
                  className="px-2 py-1 rounded-md bg-slate-800 text-slate-200 font-mono text-[11px] border border-white/5"
                >
                  {scope}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Zero-Leak Security:</strong> Tokens and secrets are stored in your encrypted server environment. The client browser only receives a revocable session token.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
          <a
            href={account.officialDocUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Open Developer Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onToggleConnection(account.id);
                onClose();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                isConnected
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
              }`}
            >
              {isConnected ? (
                <>
                  <Power className="w-3.5 h-3.5" />
                  <span>Disconnect Account</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Simulate OAuth Handshake</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
