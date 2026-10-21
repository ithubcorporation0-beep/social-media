'use client';

import React, { useState } from 'react';
import { SocialInteraction, PlatformId } from '@/types/dashboard';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  Info,
  CornerDownRight,
  Filter,
  Check
} from 'lucide-react';
import {
  LinkedInIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  XTwitterIcon
} from '@/components/icons/PlatformIcons';

interface EngagementHubProps {
  interactions: SocialInteraction[];
  onSendReply: (interactionId: string, replyText: string) => void;
}

export default function EngagementHub({ interactions, onSendReply }: EngagementHubProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | 'all'>('all');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);

  const filteredInteractions = interactions.filter((item) => {
    if (selectedPlatform !== 'all' && item.platform !== selectedPlatform) {
      return false;
    }
    return true;
  });

  const getPlatformIcon = (platform: PlatformId) => {
    switch (platform) {
      case 'linkedin': return <LinkedInIcon className="w-4 h-4 text-blue-400" />;
      case 'facebook': return <FacebookIcon className="w-4 h-4 text-blue-500" />;
      case 'instagram': return <InstagramIcon className="w-4 h-4 text-pink-400" />;
      case 'youtube': return <YouTubeIcon className="w-4 h-4 text-red-500" />;
      case 'x': return <XTwitterIcon className="w-4 h-4 text-slate-300" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  const generateQuickReply = (item: SocialInteraction, type: 'helpful' | 'warm' | 'question' | 'roman_urdu') => {
    let reply = '';
    if (type === 'helpful') {
      if (item.commentText.toLowerCase().includes('rls') || item.commentText.toLowerCase().includes('security')) {
        reply = 'We recommend enforcing Row-Level Security directly at the PostgreSQL layer in Supabase. That way, even if client requests bypass UI guards, the database engine strictly enforces user isolation.';
      } else if (item.commentText.toLowerCase().includes('open-source')) {
        reply = 'Yes! We are finalizing the modular Next.js App Router OAuth handlers and will release an open-source template repository in the next phase.';
      } else {
        reply = 'Thanks for asking! We handle this using server-side Route Handlers in Next.js, ensuring client tokens are refreshed securely without exposing secrets.';
      }
    } else if (type === 'warm') {
      reply = 'Thank you so much for the thoughtful feedback! Really glad this breakdown was helpful to you.';
    } else if (type === 'question') {
      reply = 'Appreciate your insight! What stack or database architecture is your team currently using for this?';
    } else if (type === 'roman_urdu') {
      reply = 'Bohot shukriya! Khushi hui ke aapko yeh visual breakdown pasand aaya. Next.js 16 mein hum server-side Route Handlers use kartay hain token refresh ke liye.';
    }

    setReplyDrafts((prev) => ({ ...prev, [item.id]: reply }));
    setActiveReplyId(item.id);
  };

  const handleApproveAndSend = (interactionId: string) => {
    const text = replyDrafts[interactionId];
    if (!text || !text.trim()) return;

    setSendingId(interactionId);
    setTimeout(() => {
      onSendReply(interactionId, text);
      setSendingId(null);
      setActiveReplyId(null);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/25 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Social Engagement Hub</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-mono">
                HITL Approval Required
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interact with verified comments across supported official APIs with AI suggested replies and strict approval safeguards.
            </p>
          </div>
        </div>

        {/* Platform Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-white/10 rounded-xl text-xs self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {[
            { id: 'all', label: 'All' },
            { id: 'linkedin', label: 'LinkedIn' },
            { id: 'facebook', label: 'Facebook' },
            { id: 'instagram', label: 'Instagram' },
            { id: 'youtube', label: 'YouTube' },
            { id: 'x', label: 'X' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPlatform(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedPlatform === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* X (Twitter) Unsupported Notice Callout if filtered */}
      {(selectedPlatform === 'x' || selectedPlatform === 'all') && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">X (Twitter) Free Tier API Limitation:</strong> Mentions and comments reading is not supported on the free tier (requires X Basic Tier at $100/mo). To maintain compliance, SocialHub AI does not scrape X. Outbound tweet writing is supported.
          </div>
        </div>
      )}

      {/* Interactions Feed */}
      <div className="space-y-4">
        {filteredInteractions.map((item) => {
          const isReplied = item.status === 'replied';
          const draftText = replyDrafts[item.id] || '';
          const isReplying = activeReplyId === item.id;
          const isSubmitting = sendingId === item.id;

          return (
            <div
              key={item.id}
              className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4 transition-all hover:border-white/10"
            >
              {/* Interaction Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-indigo-300">
                    {item.authorName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">{item.authorName}</span>
                      <span className="text-slate-500 font-mono text-xs">{item.authorHandle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        {getPlatformIcon(item.platform)}
                        <span className="capitalize">{item.platform}</span>
                      </span>
                      <span>•</span>
                      <span>On post: <em className="text-slate-300">"{item.postTitle}"</em></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-white/5">
                    Perm: {item.requiredPermission}
                  </span>
                  {isReplied ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Replied
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-3 h-3" /> Awaiting Reply
                    </span>
                  )}
                </div>
              </div>

              {/* Comment Content */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-xs text-slate-200 leading-relaxed font-sans">
                {item.commentText}
              </div>

              {/* Existing Sent Reply (if already replied) */}
              {isReplied && item.replyText && (
                <div className="ml-6 pl-4 border-l-2 border-emerald-500/40 space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Your Sent Reply ({item.repliedAt || 'Recently'})</span>
                  </div>
                  <p className="text-xs text-slate-300 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 whitespace-pre-line leading-relaxed">
                    {item.replyText}
                  </p>
                </div>
              )}

              {/* AI Suggested Reply Generator & Interactive Box */}
              {!isReplied && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Reply Suggestions (Requires Approval):</span>
                    </span>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <button
                        onClick={() => generateQuickReply(item, 'helpful')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 font-medium text-[11px] transition-colors"
                      >
                        💡 Informative
                      </button>
                      <button
                        onClick={() => generateQuickReply(item, 'warm')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/5 text-slate-300 hover:text-white font-medium text-[11px] transition-colors"
                      >
                        🌟 Appreciative
                      </button>
                      <button
                        onClick={() => generateQuickReply(item, 'question')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 border border-white/5 text-slate-300 hover:text-white font-medium text-[11px] transition-colors"
                      >
                        🤝 Follow-up Q
                      </button>
                      <button
                        onClick={() => generateQuickReply(item, 'roman_urdu')}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 font-medium text-[11px] transition-colors"
                      >
                        🇵🇰 Roman Urdu
                      </button>
                    </div>
                  </div>

                  {/* Reply Input Box */}
                  <div className="space-y-2">
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={draftText}
                        onChange={(e) => {
                          setReplyDrafts({ ...replyDrafts, [item.id]: e.target.value });
                          setActiveReplyId(item.id);
                        }}
                        placeholder="Select an AI suggestion above or type your customized reply here..."
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Manual confirmation prevents unauthorized/spam replies.</span>
                      </div>

                      <button
                        onClick={() => handleApproveAndSend(item.id)}
                        disabled={isSubmitting || !draftText.trim()}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmitting ? 'Sending via Official API...' : 'Approve & Send Reply'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
