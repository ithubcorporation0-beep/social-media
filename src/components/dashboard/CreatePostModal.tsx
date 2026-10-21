'use client';

import React, { useState } from 'react';
import { PlatformId, ContentItem } from '@/types/dashboard';
import { X, Sparkles, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePost: (newPost: Omit<ContentItem, 'id' | 'createdAt'>) => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSavePost,
}: CreatePostModalProps) {
  const [platform, setPlatform] = useState<PlatformId>('linkedin');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('Tech, AI, Career');
  const [actionType, setActionType] = useState<'draft' | 'schedule'>('draft');
  const [scheduledDate, setScheduledDate] = useState('2026-10-24T10:00');

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
    } else if (platform === 'x') {
      setTitle('SocialHub AI Architecture');
      setBody(
        'Building full-stack AI with Next.js 16 + Supabase RLS.\n\nKey rule: Client bundles never touch API secrets. Official OAuth 2.0 only. #BuildInPublic #AI'
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

    onSavePost({
      title,
      body,
      platform,
      status: actionType === 'schedule' ? 'scheduled' : 'draft',
      scheduledFor: actionType === 'schedule' ? new Date(scheduledDate).toISOString() : undefined,
      tags: parsedTags,
      charCount: body.length,
      isDemo: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
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

          {/* Post Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Internal Reference Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Tech Update #42"
              className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Post Body */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-300">Post Caption / Body</label>
              <span className={`text-[11px] font-mono ${isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                {body.length} / {limit} chars
              </span>
            </div>
            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Draft your post message here..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Hashtags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="AI, NextJS, WebDev"
              className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
          </div>

          {/* Publishing Dispatch Mode */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="actionType"
                  checked={actionType === 'draft'}
                  onChange={() => setActionType('draft')}
                  className="accent-indigo-500"
                />
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Save as Draft</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="actionType"
                  checked={actionType === 'schedule'}
                  onChange={() => setActionType('schedule')}
                  className="accent-indigo-500"
                />
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Schedule for Later</span>
              </label>
            </div>

            {actionType === 'schedule' && (
              <div className="pt-2 border-t border-white/5 space-y-1">
                <label className="text-slate-400 font-medium">Scheduled Dispatch Time (Local)</label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isOverLimit || !title.trim() || !body.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
            >
              {actionType === 'schedule' ? 'Save & Schedule' : 'Save to Drafts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
