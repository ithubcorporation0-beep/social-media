'use client';

import React, { useState } from 'react';
import { ContentItem, PlatformId } from '@/types/dashboard';
import { 
  X, 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send, 
  Heart, 
  Bookmark, 
  Share, 
  MoreHorizontal, 
  Globe2, 
  ExternalLink,
  Sparkles,
  Music,
  Plus
} from 'lucide-react';
import {
  LinkedInIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  XTwitterIcon,
  TikTokIcon
} from '@/components/icons/PlatformIcons';

interface PostPreviewModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPublish?: (item: ContentItem) => void;
}

export default function PostPreviewModal({
  item,
  isOpen,
  onClose,
  onConfirmPublish,
}: PostPreviewModalProps) {
  if (!isOpen || !item) return null;

  const [previewPlatform, setPreviewPlatform] = useState<PlatformId>(item.platform);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Social Feed Mockup Preview</h2>
              <p className="text-xs text-slate-400">Preview how your post renders natively on external platforms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Preview Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-white/10 rounded-xl text-xs font-medium">
          {[
            { id: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
            { id: 'facebook', label: 'Facebook', icon: FacebookIcon },
            { id: 'instagram', label: 'Instagram', icon: InstagramIcon },
            { id: 'x', label: 'X (Twitter)', icon: XTwitterIcon },
            { id: 'tiktok', label: 'TikTok', icon: TikTokIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = previewPlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPreviewPlatform(tab.id as PlatformId)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Realistic Social Feed Canvas */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 flex justify-center">
          {/* LinkedIn Mockup */}
          {previewPlatform === 'linkedin' && (
            <div className="w-full max-w-lg bg-[#1b2230] rounded-xl border border-slate-700/60 p-4 text-slate-100 space-y-3 font-sans shadow-lg">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                    DO
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">Demo Operator</h4>
                    <p className="text-[11px] text-slate-400">Full-Stack AI Developer • SocialHub AI</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      Just now • <Globe2 className="w-3 h-3 text-slate-400" />
                    </p>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              {/* Body */}
              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {item.body}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 text-[11px] text-blue-400">
                {item.tags.map(t => `#${t}`).join(' ')}
              </div>

              {/* Reactions Bar */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-medium">
                <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <ThumbsUp className="w-4 h-4" /> <span>Like</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <MessageSquare className="w-4 h-4" /> <span>Comment</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <Repeat2 className="w-4 h-4" /> <span>Repost</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                  <Send className="w-4 h-4" /> <span>Send</span>
                </button>
              </div>
            </div>
          )}

          {/* X (Twitter) Mockup */}
          {previewPlatform === 'x' && (
            <div className="w-full max-w-lg bg-black rounded-xl border border-slate-800 p-4 text-slate-100 space-y-3 font-sans shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-sm shrink-0">
                  DO
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs truncate">
                      <span className="font-bold text-white">Demo Operator</span>
                      <span className="text-slate-500 font-mono text-[11px]">@demo_operator</span>
                      <span className="text-slate-500">· 1m</span>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-500" />
                  </div>

                  <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                    {item.body}
                  </p>

                  <div className="flex items-center justify-between text-slate-500 text-xs pt-1 max-w-sm">
                    <button className="flex items-center gap-1 hover:text-blue-400">
                      <MessageSquare className="w-3.5 h-3.5" /> <span>4</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-emerald-400">
                      <Repeat2 className="w-3.5 h-3.5" /> <span>12</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-rose-400">
                      <Heart className="w-3.5 h-3.5" /> <span>38</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-400">
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instagram Mockup */}
          {previewPlatform === 'instagram' && (
            <div className="w-full max-w-md bg-black rounded-xl border border-slate-800 p-3 text-slate-100 space-y-3 shadow-lg font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-[2px]">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-bold">
                      DO
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">demo_operator</span>
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              {/* Visual media canvas */}
              <div className="w-full aspect-square rounded-lg bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-white/5 flex flex-col items-center justify-center p-6 text-center">
                <Sparkles className="w-8 h-8 text-indigo-400 mb-2" />
                <p className="text-xs font-semibold text-slate-200 px-4">{item.title}</p>
                <span className="text-[10px] text-slate-500 mt-2 font-mono">1080 x 1080 • Verified Format</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-slate-200">
                  <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer" />
                  <MessageSquare className="w-5 h-5 cursor-pointer" />
                  <Send className="w-5 h-5 cursor-pointer" />
                </div>
                <Bookmark className="w-5 h-5 text-slate-200 cursor-pointer" />
              </div>

              <div className="text-xs text-slate-300">
                <span className="font-bold text-white mr-2">demo_operator</span>
                <span className="whitespace-pre-line leading-relaxed">{item.body.slice(0, 160)}...</span>
              </div>
            </div>
          )}

          {/* Facebook Mockup */}
          {previewPlatform === 'facebook' && (
            <div className="w-full max-w-lg bg-[#18191a] rounded-xl border border-slate-800 p-4 text-slate-100 space-y-3 font-sans shadow-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                  SH
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">SocialHub AI Community</h4>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    Just now · <Globe2 className="w-3 h-3 text-slate-400" />
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {item.body}
              </p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-around text-xs text-slate-400 font-medium">
                <button className="flex items-center gap-1.5 hover:text-blue-500">
                  <ThumbsUp className="w-4 h-4" /> <span>Like</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-500">
                  <MessageSquare className="w-4 h-4" /> <span>Comment</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-blue-500">
                  <Share className="w-4 h-4" /> <span>Share</span>
                </button>
              </div>
            </div>
          )}

          {/* TikTok Vertical Video Feed Mockup */}
          {previewPlatform === 'tiktok' && (
            <div className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl flex flex-col justify-between p-4 text-white font-sans">
              {/* Background gradient simulating video content */}
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-indigo-950/40 to-black/90 pointer-events-none" />

              {/* Center Video Content Cue */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-white tracking-wide uppercase">9:16 Video Canvas</p>
                <span className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate">{item.title}</span>
              </div>

              {/* Top Navigation */}
              <div className="relative z-20 flex items-center justify-center gap-5 pt-1 text-xs font-semibold">
                <span className="text-slate-400">Following</span>
                <span className="text-white border-b-2 border-white pb-0.5">For You</span>
              </div>

              {/* Bottom & Right Overlay */}
              <div className="relative z-20 flex items-end justify-between gap-3 pb-1">
                {/* Left Bottom Info */}
                <div className="space-y-2 flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white hover:underline cursor-pointer">@socialhub_creator</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 text-black text-[9px] font-bold flex items-center justify-center">✓</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-snug line-clamp-3">
                    {item.body}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <Music className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">♫ Original audio - SocialHub AI Studio</span>
                  </div>
                </div>

                {/* Right Action Icons Column */}
                <div className="flex flex-col items-center gap-3.5 shrink-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-500 border border-white/40 flex items-center justify-center font-bold text-xs text-white">
                      SH
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                      <Heart className="w-6 h-6 hover:text-rose-500" />
                    </button>
                    <span className="text-[10px] font-semibold text-slate-300">24.5K</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                      <MessageSquare className="w-6 h-6" />
                    </button>
                    <span className="text-[10px] font-semibold text-slate-300">842</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                      <Bookmark className="w-6 h-6" />
                    </button>
                    <span className="text-[10px] font-semibold text-slate-300">3.1K</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <button className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
                      <Share className="w-6 h-6" />
                    </button>
                    <span className="text-[10px] font-semibold text-slate-300">1.4K</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="text-xs text-slate-400 font-mono">
            {item.charCount} characters • Status: <span className="text-indigo-400 uppercase font-semibold">{item.status}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
            >
              Close
            </button>

            {onConfirmPublish && item.status !== 'published' && (
              <button
                onClick={() => {
                  onConfirmPublish(item);
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish to Platform</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
