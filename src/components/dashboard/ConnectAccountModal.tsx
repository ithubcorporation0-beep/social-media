'use client';

import React, { useState, useEffect } from 'react';
import { SocialAccount } from '@/types/dashboard';
import { 
  X, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  RefreshCw, 
  Power, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Copy,
  Check,
  Bug,
  Sparkles,
  Briefcase
} from 'lucide-react';

interface ConnectAccountModalProps {
  account: SocialAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleConnection: (id: string, updatedData?: Partial<SocialAccount>) => void;
}

export default function ConnectAccountModal({
  account,
  isOpen,
  onClose,
  onToggleConnection,
}: ConnectAccountModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusReport, setStatusReport] = useState<any>(null);
  const [testErrorResult, setTestErrorResult] = useState<string | null>(null);

  // Fetch live backend status when opened
  useEffect(() => {
    if (isOpen && account) {
      if (account.platform === 'linkedin') {
        fetchStatus('/api/auth/linkedin/status');
      } else if (account.platform === 'facebook' || account.platform === 'instagram') {
        fetchStatus('/api/auth/meta/status');
      } else {
        setStatusReport(null);
        setTestErrorResult(null);
      }
    } else {
      setStatusReport(null);
      setTestErrorResult(null);
    }
  }, [isOpen, account?.platform]);

  const fetchStatus = async (endpoint: string) => {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setStatusReport(data);
      }
    } catch (e) {
      console.error('Failed to fetch status:', e);
    }
  };

  if (!isOpen || !account) return null;

  const isLinkedIn = account.platform === 'linkedin';
  const isMeta = account.platform === 'facebook' || account.platform === 'instagram';
  const isTikTok = account.platform === 'tiktok';
  const isAdzuna = account.platform === 'adzuna';
  const isConnected = account.status === 'connected' || statusReport?.connected;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const redirectUri = isLinkedIn
    ? `${originUrl}/api/auth/linkedin/callback`
    : isMeta
    ? `${originUrl}/api/auth/meta/callback`
    : `${originUrl}/api/auth/callback/${account.platform}`;

  const handleCopyRedirectUri = () => {
    navigator.clipboard.writeText(redirectUri);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleInitiateOAuth = () => {
    setIsLoading(true);
    setTestErrorResult(null);

    if (isLinkedIn) {
      window.location.href = '/api/auth/linkedin/authorize';
    } else if (isMeta) {
      window.location.href = '/api/auth/meta/authorize';
    } else {
      window.location.href = `/api/auth/${account.platform}/authorize`;
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      if (isLinkedIn) {
        await fetch('/api/auth/linkedin/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'disconnect' }),
        });
        await fetchStatus('/api/auth/linkedin/status');
      } else if (isMeta) {
        await fetch('/api/auth/meta/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'disconnect' }),
        });
        await fetchStatus('/api/auth/meta/status');
      }
      onToggleConnection(account.id, {
        status: 'disconnected',
        handle: '@not-connected',
      });
      onClose();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestErrorSimulation = async (errorCode: '401' | '429') => {
    setIsLoading(true);
    setTestErrorResult(null);
    try {
      const res = await fetch('/api/social/publish/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: 'Diagnostic test post for error verification',
          simulateError: errorCode,
        }),
      });
      const data = await res.json();
      setTestErrorResult(`HTTP ${res.status}: ${data.error}`);
    } catch (err: any) {
      setTestErrorResult(`Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              isLinkedIn 
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' 
                : isMeta
                ? 'bg-blue-600/10 border border-blue-600/20 text-blue-500'
                : isTikTok
                ? 'bg-slate-800 border border-slate-700 text-white'
                : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
            }`}>
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {account.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {isLinkedIn ? 'Phase 1 Active' : isMeta ? 'Phase 2 Ready' : isTikTok ? 'Content API V2' : 'Official API'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Official OAuth 2.0 Integration & Key Vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Callout */}
        {(isLinkedIn || isMeta) && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Integration Status:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-white/5'
              }`}>
                {isConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                {isConnected ? 'Active & Handshake Verified' : 'Not Connected'}
              </span>
            </div>

            {/* Token Encryption Vault Badge */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Token Vault Storage</div>
                  <div className="text-emerald-300 font-semibold">AES-256-GCM Encrypted</div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-white/5 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 font-medium">Browser Leakage Protection</div>
                  <div className="text-indigo-300 font-semibold">Zero Secrets in Client</div>
                </div>
              </div>
            </div>

            {statusReport?.tokenExpiresAt && (
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Access Token Expiry:</span>
                <span className="font-mono text-slate-200">
                  {new Date(statusReport.tokenExpiresAt).toLocaleDateString()} (60-day standard)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Facebook Page Official Setup Guide */}
        {account.platform === 'facebook' && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-300">
              <Key className="w-4 h-4 text-blue-400" />
              <span>Facebook Page Official Setup Guide:</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-blue-200/90 leading-relaxed">
              <li>Open <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-blue-300 hover:text-white">developers.facebook.com/apps</a> and click <strong>Create App</strong> &rarr; <strong>Other</strong> &rarr; <strong>Business</strong>.</li>
              <li>Add the <strong>Facebook Login for Business</strong> product to your app.</li>
              <li>In Facebook Login Settings, paste the <strong>Redirect URI</strong> below into <em>Valid OAuth Redirect URIs</em>.</li>
              <li>Under App Settings &rarr; Basic, copy your <strong>App ID</strong> and <strong>App Secret</strong>.</li>
              <li>Add <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">META_APP_ID</code> and <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">META_APP_SECRET</code> to your <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">.env.local</code> and Vercel Environment Variables.</li>
              <li>Click <strong>Connect Official OAuth</strong> below to log into Facebook and authorize your Page!</li>
            </ol>
          </div>
        )}

        {/* LinkedIn Official Setup Guide */}
        {account.platform === 'linkedin' && (
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-blue-300">
              <Key className="w-4 h-4 text-blue-400" />
              <span>LinkedIn Official Setup Guide:</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-blue-200/90 leading-relaxed">
              <li>Open <a href="https://www.linkedin.com/developers/apps" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-blue-300 hover:text-white">linkedin.com/developers/apps</a> and create an app.</li>
              <li>Under the <strong>Products</strong> tab, request access to: <strong>"Sign In with LinkedIn using OpenID Connect"</strong> and <strong>"Share on LinkedIn"</strong>.</li>
              <li>Under the <strong>Auth</strong> tab, add the <strong>Redirect URI</strong> below to <em>Authorized redirect URLs for your app</em>.</li>
              <li>Copy Client ID and Client Secret into your <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">.env.local</code> and Vercel as <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">LINKEDIN_CLIENT_ID</code> and <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">LINKEDIN_CLIENT_SECRET</code>.</li>
            </ol>
          </div>
        )}

        {/* TikTok Official Setup Guide */}
        {account.platform === 'tiktok' && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs text-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <Key className="w-4 h-4 text-slate-300" />
              <span>TikTok for Developers Setup Guide:</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
              <li>Open <a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-indigo-400 hover:text-white">developers.tiktok.com</a> and register your developer account.</li>
              <li>Under <strong>My Apps</strong>, create a new app and enable <strong>Login Kit</strong> and <strong>Content Posting API</strong>.</li>
              <li>Under Redirect Domains, add your domain and the <strong>Redirect URI</strong> below to your TikTok app console.</li>
              <li>Configure <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-300 font-mono">TIKTOK_CLIENT_KEY</code> and <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-300 font-mono">TIKTOK_CLIENT_SECRET</code> in your local environment.</li>
            </ol>
          </div>
        )}

        {/* Indeed / Manual Workflow Policy Notice */}
        {account.platform === 'adzuna' && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Indeed & Job Board Compliance Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-200/90">
              Indeed does not provide public search or application submission APIs without enterprise ATS partnerships. Scraping Indeed violates their Terms of Service. SocialHub AI uses the official <strong>Adzuna API</strong> for live search and provides a safe personal tracker for external job links you manually save.
            </p>
          </div>
        )}

        {/* Integration Specs & Rules */}
        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-semibold text-slate-300">Registered Redirect URI (Callback):</span>
              <button
                onClick={handleCopyRedirectUri}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URI'}</span>
              </button>
            </div>
            <code className="block p-2 rounded-lg bg-slate-950 font-mono text-[11px] text-indigo-300 select-all border border-indigo-500/20 break-all">
              {redirectUri}
            </code>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Requested Official Permissions (Scopes):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {account.requiredScopes.map((scope) => (
                <span
                  key={scope}
                  className={`px-2.5 py-1 rounded-md font-mono text-[11px] border flex items-center gap-1 ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-200 border-white/5'
                  }`}
                >
                  {isConnected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  <span>{scope}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Error simulation diagnostics for testing */}
        {isLinkedIn && isConnected && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-amber-400" />
                Integration Diagnostics & Error Handling:
              </span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleTestErrorSimulation('429')}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-medium text-[11px] transition-colors"
              >
                Test 429 Rate Limit Error
              </button>
              <button
                type="button"
                onClick={() => handleTestErrorSimulation('401')}
                disabled={isLoading}
                className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium text-[11px] transition-colors"
              >
                Test 401 Expired Token Error
              </button>
            </div>

            {testErrorResult && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-amber-500/30 text-[11px] text-amber-300 font-mono leading-relaxed">
                {testErrorResult}
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
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
              Close
            </button>

            {isConnected ? (
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 disabled:opacity-50"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Disconnect & Revoke</span>
              </button>
            ) : (
              <button
                onClick={handleInitiateOAuth}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Handshake...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Connect Official OAuth</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
