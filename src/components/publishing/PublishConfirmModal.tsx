'use client';

import React, { useState, useEffect } from 'react';
import { ContentItem, SocialAccount } from '@/types/dashboard';
import { 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  Lock,
  Sparkles,
  Key,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

interface PublishConfirmModalProps {
  item: ContentItem | null;
  account: SocialAccount | undefined;
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess: (itemId: string, externalUrl?: string, isLive?: boolean) => void;
}

export default function PublishConfirmModal({
  item,
  account,
  isOpen,
  onClose,
  onPublishSuccess,
}: PublishConfirmModalProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Facebook token configuration state
  const [checkingFbToken, setCheckingFbToken] = useState(false);
  const [hasFbToken, setHasFbToken] = useState<boolean | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [tokenStatusMessage, setTokenStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Check Facebook token status when opened
  useEffect(() => {
    if (isOpen && item?.platform === 'facebook') {
      checkFacebookToken();
    } else {
      setErrorMessage(null);
      setTokenStatusMessage(null);
      setShowTokenInput(false);
    }
  }, [isOpen, item?.platform]);

  const checkFacebookToken = async () => {
    setCheckingFbToken(true);
    try {
      const res = await fetch('/api/social/facebook/token');
      if (res.ok) {
        const data = await res.json();
        setHasFbToken(Boolean(data.hasToken));
        if (!data.hasToken) {
          setShowTokenInput(true);
        }
      }
    } catch {
      // Fallback
    } finally {
      setCheckingFbToken(false);
    }
  };

  const handleSaveFacebookToken = async () => {
    if (!tokenInput.trim()) {
      setTokenStatusMessage({ type: 'error', text: 'Please enter a Facebook Page Access Token.' });
      return;
    }

    setIsSavingToken(true);
    setTokenStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/social/facebook/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenInput.trim(),
          pageId: '61551470574335',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHasFbToken(true);
        setTokenStatusMessage({ 
          type: 'success', 
          text: 'Token verified with Meta Graph API & saved successfully! You can now publish live.' 
        });
        setTokenInput('');
        setShowTokenInput(false);
      } else {
        setTokenStatusMessage({ 
          type: 'error', 
          text: data.error || 'Failed to verify token with Facebook.' 
        });
      }
    } catch (err: any) {
      setTokenStatusMessage({ 
        type: 'error', 
        text: err.message || 'Network error verifying token.' 
      });
    } finally {
      setIsSavingToken(false);
    }
  };

  if (!isOpen || !item) return null;

  const isConnected = account?.status === 'connected' || hasFbToken === true;

  const workingUrl =
    item.platform === 'facebook'
      ? 'https://www.facebook.com/profile.php?id=61551470574335'
      : item.platform === 'linkedin'
      ? 'https://www.linkedin.com/feed'
      : item.platform === 'tiktok'
      ? 'https://www.tiktok.com/@creator/video/1029384756'
      : item.platform === 'x'
      ? 'https://x.com/status'
      : 'https://instagram.com';

  const handleExecutePublish = async () => {
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      if (item.platform === 'facebook') {
        const res = await fetch('/api/social/publish/facebook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: item.body,
            mediaUrl: item.mediaUrl,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success && data.postUrl) {
          // Real live publish confirmed by Facebook Graph API
          onPublishSuccess(item.id, data.postUrl, true);
          onClose();
          return;
        } else {
          // Real failure from Facebook or missing token
          setErrorMessage(data.error || 'Facebook API error occurred.');
          if (data.requiresToken) {
            setHasFbToken(false);
            setShowTokenInput(true);
          }
          setIsPublishing(false);
          return;
        }
      } else if (item.platform === 'linkedin') {
        const res = await fetch('/api/social/publish/linkedin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: item.body,
            idempotencyKey: `idem_${item.id}_${Date.now()}`,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success && data.externalUrl) {
          onPublishSuccess(item.id, data.externalUrl, !data.isSandbox);
          onClose();
          return;
        } else {
          setErrorMessage(data.error || 'LinkedIn API error occurred.');
          setIsPublishing(false);
          return;
        }
      } else {
        // Platform sandbox simulation
        await new Promise((resolve) => setTimeout(resolve, 800));
        onPublishSuccess(item.id, workingUrl, false);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while communicating with the server.');
      setIsPublishing(false);
    }
  };

  // Explicit sandbox simulation if user doesn't have token right now
  const handleSimulatePublishOnly = () => {
    onPublishSuccess(item.id, workingUrl, false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6 space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Confirm External Publishing</h2>
              <p className="text-xs text-slate-400">Live API dispatch to social platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Facebook Missing Token Banner & In-Modal Token Input */}
        {item.platform === 'facebook' && hasFbToken === false && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">Facebook Page Access Token Required</p>
                <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                  Facebook requires a valid Page Access Token with <code>pages_manage_posts</code> permission to post to <strong>IZBA Marketing agency</strong> (ID: <code>61551470574335</code>).
                </p>
              </div>
            </div>

            {/* Quick Token Paste Field */}
            {showTokenInput && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 space-y-2">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Paste Facebook Page Access Token:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="EAA..."
                    className="flex-1 bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <button
                    onClick={handleSaveFacebookToken}
                    disabled={isSavingToken || !tokenInput.trim()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    {isSavingToken ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    <span>Verify & Save</span>
                  </button>
                </div>

                {tokenStatusMessage && (
                  <p className={`text-[11px] font-medium leading-relaxed ${tokenStatusMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tokenStatusMessage.text}
                  </p>
                )}

                {/* 60-Second Setup Guide Accordion */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGuide(!showGuide)}
                    className="text-[11px] text-indigo-300 hover:text-indigo-200 flex items-center gap-1 font-semibold"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>How to get this token in 60 seconds (Meta Graph API Explorer)</span>
                    {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {showGuide && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-900/90 border border-indigo-500/20 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                      <ol className="list-decimal pl-4 space-y-1 text-slate-300">
                        <li>
                          Open <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-bold inline-flex items-center gap-0.5">
                            Meta Graph API Explorer <ExternalLink className="w-2.5 h-2.5 inline" />
                          </a>.
                        </li>
                        <li>In the <strong>User or Page</strong> dropdown, choose your page: <strong>IZBA Marketing agency</strong>.</li>
                        <li>Under <strong>Permissions</strong>, ensure <code>pages_manage_posts</code> and <code>pages_read_engagement</code> are selected.</li>
                        <li>Click <strong>Generate Access Token</strong>, copy the token and paste it above!</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Facebook Connected Confirmation Badge */}
        {item.platform === 'facebook' && hasFbToken === true && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Live Facebook Connection Active</span>
              <p className="text-[11px] text-emerald-200/80">Authorized to publish directly to <strong>IZBA Marketing agency</strong>.</p>
            </div>
          </div>
        )}

        {/* Target Details */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Target Platform</span>
            <span className="font-semibold text-white capitalize">{item.platform}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Target Account</span>
            <span className="font-mono text-indigo-300">
              {item.platform === 'facebook' ? 'IZBA Marketing agency (@page_61551470574335)' : account?.handle || '@connected_account'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Direct Page ID</span>
            <span className="font-mono text-slate-300">
              {item.platform === 'facebook' ? '61551470574335' : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">API Endpoint</span>
            <span className="font-mono text-[11px] text-slate-400">
              {item.platform === 'facebook' ? 'graph.facebook.com/v19.0/{page-id}/feed' : 'api.linkedin.com/v2/ugcPosts'}
            </span>
          </div>
        </div>

        {/* Post Snippet */}
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-slate-400">Content Snapshot:</span>
          <div className="p-3 bg-slate-950 rounded-xl border border-white/5 text-slate-300 whitespace-pre-line line-clamp-3 text-xs leading-relaxed">
            {item.body}
          </div>
        </div>

        {/* Error Callout if triggered */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <X className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <span className="font-bold">Publishing Error from Facebook / Server:</span>
              <p className="text-[11px] text-rose-200/90 leading-relaxed font-mono">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 gap-2">
          {/* Secondary fallback: Sandbox preview */}
          {item.platform === 'facebook' && hasFbToken === false ? (
            <button
              type="button"
              onClick={handleSimulatePublishOnly}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              Save in Dashboard Only (Sandbox)
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isPublishing}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              onClick={handleExecutePublish}
              disabled={isPublishing || checkingFbToken}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPublishing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing to Facebook Page...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Confirm & Publish to {
                      item.platform === 'facebook'
                        ? 'Facebook (IZBA Marketing)'
                        : item.platform === 'linkedin'
                        ? 'LinkedIn'
                        : item.platform.toUpperCase()
                    }
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
