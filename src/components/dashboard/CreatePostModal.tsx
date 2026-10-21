'use client';

import React, { useState, useEffect } from 'react';
import { PlatformId, ContentItem } from '@/types/dashboard';
import { X, Sparkles, Calendar, FileText, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePost: (newPost: Omit<ContentItem, 'id' | 'createdAt'>) => void;
  initialScheduledDate?: string;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSavePost,
  initialScheduledDate,
}: CreatePostModalProps) {
  const [platform, setPlatform] = useState<PlatformId>('linkedin');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('Tech, AI, Career');
  const [actionType, setActionType] = useState<'draft' | 'schedule'>('draft');
  const [scheduledDate, setScheduledDate] = useState('2026-10-24T10:00');

  useEffect(() => {
    if (initialScheduledDate) {
      setScheduledDate(initialScheduledDate);
      setActionType('schedule');
    }
  }, [initialScheduledDate]);

  if (!isOpen) return null;

  const platformLimits: Record<PlatformId, number> = {
    linkedin: 3000,
    facebook: 63206,
    instagram: 2200,
    youtube: 5000,
    x: 280,
    adzuna: 1000,
  };

  const limit = platformLimits[platform] || 3000;
  const isOverLimit = body.length > limit;

  const handleAiQuickGenerate = () => {
    // Generates a platform-tailored starter hook
    if (platform === 'linkedin') {
      setTitle('Building Enterprise AI Workflows with Zero Secret Leaks');
      setBody(
        'Here is the exact security checklist we follow when orchestrating multi-platform content:\n\n1. All OAuth secrets stay strictly on the server layer.\n2. Supabase Row-Level Security isolates multi-tenant records.\n3. Background queues prevent accidental duplicate publishing.\n\nSecurity is not an afterthought — it is the foundation. How are you handling API secret rotation in your stack?'
      );
    } else if (platform === 'instagram') {
      setTitle('Full-Stack Social Architecture Visualizer');
      setBody(
        'Swipe through to see how SocialHub AI handles OAuth token exchanges without exposing client secrets! 🚀\n\nDrop a comment if you want the open-source blueprint.'
      );
    } else {
      setTitle('New Feature Preview');
      setBody('Testing verified API publishing pipeline. Official OAuth integration active and healthy.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || isOverLimit) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const isScheduling = actionType === 'schedule';
    const targetDateIso = isScheduling ? new Date(scheduledDate).toISOString() : undefined;
    const idempotencyKey = isScheduling
      ? `idem_sched_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      : undefined;

    onSavePost({
      title,
      body,
      platform,
      status: isScheduling ? 'scheduled' : 'draft',
      scheduledFor: targetDateIso,
      tags: parsedTags,
      charCount: body.length,
      isDemo: false,
      idempotencyKey,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Create New Post</h2>
              <p className="text-xs text-slate-400">Save as draft or schedule for automated dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Platform Selector */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Target Platform</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(['linkedin', 'facebook', 'instagram', 'youtube', 'x'] as PlatformId[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`p-2.5 rounded-xl border text-center font-medium capitalize transition-all ${
                    platform === p
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Quick AI Starter Button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400 font-medium">Quick draft assistance</span>
            <button
              type="button"
              onClick={handleAiQuickGenerate}
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Draft with AI Hook</span>
            </button>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Internal Reference Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Enterprise Architecture Breakdown"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Body Content */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-300">Post Content</label>
              <span className={`font-mono text-[11px] ${isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                {body.length} / {limit} chars
              </span>
            </div>
            <textarea
              required
              rows={5}
              placeholder="Write your post draft or paste generated studio text here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Hashtags / Topics (comma-separated)</label>
            <input
              type="text"
              placeholder="AI, SoftwareEngineering, Cloud"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Action Choice: Save Draft or Schedule */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <label className="font-semibold text-slate-300">Publishing Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  actionType === 'draft'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-900 border-white/5 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="draft"
                  checked={actionType === 'draft'}
                  onChange={() => setActionType('draft')}
                  className="hidden"
                />
                <FileText className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="font-bold">Save as Draft</div>
                  <div className="text-[10px] text-slate-400">Keep in pipeline for review</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  actionType === 'schedule'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-900 border-white/5 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="schedule"
                  checked={actionType === 'schedule'}
                  onChange={() => setActionType('schedule')}
                  className="hidden"
                />
                <Calendar className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold">Schedule Dispatch</div>
                  <div className="text-[10px] text-slate-400">Queue for automatic release</div>
                </div>
              </label>
            </div>

            {/* Scheduled Date Picker */}
            {actionType === 'schedule' && (
              <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2 animate-in fade-in">
                <div className="flex justify-between items-center text-blue-300 font-semibold">
                  <span>Target Date & Time</span>
                  <span className="flex items-center gap-1 font-mono text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Duplicate Protection Active
                  </span>
                </div>
                <input
                  type="datetime-local"
                  required={actionType === 'schedule'}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-blue-500/30 rounded-lg text-white font-mono focus:outline-none focus:border-blue-400"
                />
                <p className="text-[10px] text-blue-200/80 leading-relaxed">
                  Posts are scheduled via the official backend queue with exclusive idempotency locks.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isOverLimit || !title.trim() || !body.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{actionType === 'schedule' ? 'Schedule Post' : 'Save Draft'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
