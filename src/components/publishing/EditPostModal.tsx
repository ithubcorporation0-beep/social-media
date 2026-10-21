'use client';

import React, { useState, useEffect } from 'react';
import { ContentItem, PlatformId } from '@/types/dashboard';
import { X, Save, Trash2, Calendar, FileText, AlertCircle, Eye } from 'lucide-react';

interface EditPostModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePost: (updatedItem: ContentItem) => void;
  onDeletePost: (id: string) => void;
  onPreviewPost: (item: ContentItem) => void;
}

export default function EditPostModal({
  item,
  isOpen,
  onClose,
  onUpdatePost,
  onDeletePost,
  onPreviewPost,
}: EditPostModalProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [platform, setPlatform] = useState<PlatformId>('linkedin');
  const [tags, setTags] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [status, setStatus] = useState<ContentItem['status']>('draft');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setBody(item.body);
      setPlatform(item.platform);
      setTags(item.tags.join(', '));
      setScheduledFor(item.scheduledFor ? item.scheduledFor.slice(0, 16) : '');
      setStatus(item.status);
    }
  }, [item]);

  if (!isOpen || !item) return null;

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || isOverLimit) return;

    onUpdatePost({
      ...item,
      title,
      body,
      platform,
      tags: tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
      status: scheduledFor ? 'scheduled' : status === 'scheduled' ? 'draft' : status,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      charCount: body.length,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Edit Post</h2>
            <p className="text-xs text-slate-400">Modify content, hashtags, or scheduled dispatch timing</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Internal Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Platform */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Target Social Platform</label>
            <div className="grid grid-cols-5 gap-2">
              {(['linkedin', 'facebook', 'instagram', 'youtube', 'x'] as PlatformId[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`p-2 rounded-xl border text-center font-medium capitalize transition-all ${
                    platform === p
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-300">Caption / Content</label>
              <span className={`font-mono text-[11px] ${isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                {body.length} / {limit} chars
              </span>
            </div>
            <textarea
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Scheduling Date Input */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Scheduled Date & Time (Optional)</span>
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-500">
              Clear this date to convert the post back into an unscheduled draft.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onDeletePost(item.id);
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onPreviewPost({
                    ...item,
                    title,
                    body,
                    platform,
                    tags: tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean),
                  });
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Mockup</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isOverLimit || !title.trim() || !body.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
