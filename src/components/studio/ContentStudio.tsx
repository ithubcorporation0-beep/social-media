'use client';

import React, { useState } from 'react';
import { PlatformId, ContentItem } from '@/types/dashboard';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Paperclip, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Globe, 
  Sliders, 
  Info,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';
import {
  LinkedInIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  XTwitterIcon
} from '@/components/icons/PlatformIcons';

interface ContentStudioProps {
  onSaveToPipeline: (item: Omit<ContentItem, 'id' | 'createdAt'>) => void;
}

export default function ContentStudio({ onSaveToPipeline }: ContentStudioProps) {
  // Input configuration
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState<PlatformId>('linkedin');
  const [mode, setMode] = useState<'caption' | 'hooks' | 'hashtags' | 'ideas' | 'description'>('caption');
  const [style, setStyle] = useState<'professional' | 'casual' | 'business' | 'personal'>('professional');
  const [language, setLanguage] = useState<'english' | 'roman_urdu' | 'bilingual'>('english');

  // Attachment state
  const [attachedMediaType, setAttachedMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [attachedFileName, setAttachedFileName] = useState<string>('');

  // AI Output & Approval state
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [providerBadge, setProviderBadge] = useState<string>('');
  const [approvalStatus, setApprovalStatus] = useState<'idle' | 'draft_generated' | 'edited' | 'approved'>('idle');
  const [copied, setCopied] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2026-10-25T11:00');
  const [actionChoice, setActionChoice] = useState<'draft' | 'schedule'>('draft');

  // Platform limits and media support rules
  const platformRules: Record<PlatformId, {
    charLimit: number;
    allowImage: boolean;
    allowVideo: boolean;
    requiresMedia: boolean;
    notice: string;
  }> = {
    linkedin: {
      charLimit: 3000,
      allowImage: true,
      allowVideo: true,
      requiresMedia: false,
      notice: 'Text posts, single images, and video supported on profiles and company pages.',
    },
    facebook: {
      charLimit: 63206,
      allowImage: true,
      allowVideo: true,
      requiresMedia: false,
      notice: 'Text, image, and video supported on Facebook Business Pages.',
    },
    instagram: {
      charLimit: 2200,
      allowImage: true,
      allowVideo: true,
      requiresMedia: true,
      notice: 'Instagram Graph API requires an image or video asset for feed or Reel publishing.',
    },
    youtube: {
      charLimit: 5000,
      allowImage: false,
      allowVideo: true,
      requiresMedia: true,
      notice: 'YouTube Data API requires a video file upload. Community text posts are not supported by the public API.',
    },
    x: {
      charLimit: 280,
      allowImage: true,
      allowVideo: true,
      requiresMedia: false,
      notice: 'Free tier permits write-only posting up to 280 characters with image links.',
    },
    adzuna: {
      charLimit: 1000,
      allowImage: false,
      allowVideo: false,
      requiresMedia: false,
      notice: 'Job search queries do not accept attachments.',
    },
  };

  const currentRules = platformRules[platform] || platformRules.linkedin;
  const isOverLimit = editableContent.length > currentRules.charLimit;

  // Media validation check
  const mediaCompatibilityError = (() => {
    if (attachedMediaType === 'image' && !currentRules.allowImage) {
      return `${platform.toUpperCase()} does not support image uploads via its official API endpoint.`;
    }
    if (attachedMediaType === 'video' && !currentRules.allowVideo) {
      return `${platform.toUpperCase()} does not support video uploads via this API endpoint.`;
    }
    if (currentRules.requiresMedia && attachedMediaType === 'none' && editableContent.trim()) {
      return `Official ${platform.toUpperCase()} publishing requires an attached image or video.`;
    }
    return null;
  })();

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setApprovalStatus('idle');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          platform,
          mode,
          style,
          language,
        }),
      });

      const data = await res.json();
      if (res.ok && data.content) {
        setGeneratedTitle(`${topic.slice(0, 50)} — ${platform.toUpperCase()}`);
        setEditableContent(data.content);
        setProviderBadge(data.provider || 'SocialHub AI Engine');
        setApprovalStatus('draft_generated');
      }
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
    setApprovalStatus('edited');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApproveAndSave = () => {
    if (!editableContent.trim() || isOverLimit) return;

    setApprovalStatus('approved');

    onSaveToPipeline({
      title: generatedTitle || `${topic.slice(0, 40)}`,
      body: editableContent,
      platform,
      status: actionChoice === 'schedule' ? 'scheduled' : 'draft',
      scheduledFor: actionChoice === 'schedule' ? new Date(scheduleDate).toISOString() : undefined,
      tags: [platform, style, language, mode],
      charCount: editableContent.length,
      isDemo: true,
    });
  };

  const quickTopics = [
    '5 Lessons Transitioning to Full-Stack AI Development',
    'Why Server-Side OAuth Token Isolation Matters',
    'Product Launch: SocialHub AI MVP',
    'Career Advice: How to Stand Out in 2026 Tech Job Searches',
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Studio Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">AI Content Studio</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold font-mono">
                Multilingual • Gemini / Groq
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Draft, customize, edit, and approve platform-tailored posts with verified character limits and media validation.
            </p>
          </div>
        </div>

        {/* Language Pill Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-white/10 rounded-xl self-start md:self-auto">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {(['english', 'roman_urdu', 'bilingual'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                language === lang
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid: Controls on Left, Live Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generator Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
            {/* Target Platform */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Social Platform</label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
                  { id: 'facebook', label: 'Facebook', icon: FacebookIcon },
                  { id: 'instagram', label: 'Instagram', icon: InstagramIcon },
                  { id: 'youtube', label: 'YouTube', icon: YouTubeIcon },
                  { id: 'x', label: 'X', icon: XTwitterIcon },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = platform === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPlatform(item.id as PlatformId)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/10'
                          : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{currentRules.notice}</p>
            </div>

            {/* Output Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Output Objective</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {[
                  { id: 'caption', label: 'Full Caption / Post' },
                  { id: 'hooks', label: 'Viral Hooks (x5)' },
                  { id: 'hashtags', label: 'Trending Hashtags' },
                  { id: 'ideas', label: 'Post Ideas / Angles' },
                  { id: 'description', label: 'Video Description' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`px-3 py-2 rounded-xl border text-left font-medium transition-all ${
                      mode === m.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Writing Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tone & Writing Style</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {(['professional', 'casual', 'business', 'personal'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setStyle(t)}
                    className={`py-1.5 px-2 rounded-xl border capitalize text-center font-medium transition-all ${
                      style === t
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Topic or Prompt Keypoints</label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Explain why multi-tenant row-level security is crucial for modern AI web applications..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
            </div>

            {/* Quick Templates */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Quick Topic Starters:</span>
              <div className="flex flex-wrap gap-1">
                {quickTopics.map((qt) => (
                  <button
                    key={qt}
                    onClick={() => setTopic(qt)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors truncate max-w-full text-left"
                  >
                    {qt}
                  </button>
                ))}
              </div>
            </div>

            {/* Attachment Dropzone & Media Validation */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>Media Attachment (Platform Enforced)</span>
                </span>
                {attachedMediaType !== 'none' && (
                  <button
                    onClick={() => {
                      setAttachedMediaType('none');
                      setAttachedFileName('');
                    }}
                    className="text-[10px] text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  disabled={!currentRules.allowImage}
                  onClick={() => {
                    setAttachedMediaType('image');
                    setAttachedFileName('architecture_diagram_highres.png');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    !currentRules.allowImage
                      ? 'opacity-40 cursor-not-allowed bg-slate-950 border-white/5 text-slate-600'
                      : attachedMediaType === 'image'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  📷 Attach Image
                </button>

                <button
                  type="button"
                  disabled={!currentRules.allowVideo}
                  onClick={() => {
                    setAttachedMediaType('video');
                    setAttachedFileName('walkthrough_demo_1080p.mp4');
                  }}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    !currentRules.allowVideo
                      ? 'opacity-40 cursor-not-allowed bg-slate-950 border-white/5 text-slate-600'
                      : attachedMediaType === 'video'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  🎬 Attach Video
                </button>
              </div>

              {attachedFileName && (
                <div className="p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-indigo-300 font-mono flex items-center justify-between">
                  <span>📎 {attachedFileName}</span>
                  <span className="text-[10px] text-emerald-400 font-sans">Verified</span>
                </div>
              )}

              {/* Media Error Warning */}
              {mediaCompatibilityError && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{mediaCompatibilityError}</span>
                </div>
              )}
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Post with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Platform Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Editor & Approval (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col h-full justify-between space-y-4">
            <div className="space-y-3">
              {/* Editor Header: Status and Character Limit Gauge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Editable Content Canvas</span>
                  {approvalStatus === 'draft_generated' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Draft Generated
                    </span>
                  )}
                  {approvalStatus === 'edited' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Edited by You
                    </span>
                  )}
                  {approvalStatus === 'approved' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Approved for Pipeline ✓
                    </span>
                  )}
                </div>

                {/* Character Count Progress Gauge */}
                <div className="flex items-center gap-2 text-xs">
                  <span className={`font-mono text-xs ${isOverLimit ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    {editableContent.length} / {currentRules.charLimit} chars
                  </span>
                  <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isOverLimit
                          ? 'bg-rose-500'
                          : editableContent.length / currentRules.charLimit > 0.85
                          ? 'bg-amber-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (editableContent.length / currentRules.charLimit) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Provider Info Pill */}
              {providerBadge && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Engine: {providerBadge}</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 uppercase">
                    Lang: {language} • Style: {style}
                  </span>
                </div>
              )}

              {/* Editable Textarea */}
              <div className="relative">
                <textarea
                  rows={14}
                  value={editableContent}
                  onChange={handleContentChange}
                  placeholder="AI output will generate here. You can freely edit, rewrite, or polish every single word before approving..."
                  className="w-full px-4 py-3 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans resize-none"
                />
              </div>

              {/* Character Limit Exceeded Error */}
              {isOverLimit && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Content exceeds {platform.toUpperCase()} character limit by {editableContent.length - currentRules.charLimit} characters. Please trim before publishing.
                  </span>
                </div>
              )}
            </div>

            {/* Approval Workflow & Actions */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              {/* Dispatch Action Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="studioAction"
                      checked={actionChoice === 'draft'}
                      onChange={() => setActionChoice('draft')}
                      className="accent-indigo-500"
                    />
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Save as Draft</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="studioAction"
                      checked={actionChoice === 'schedule'}
                      onChange={() => setActionChoice('schedule')}
                      className="accent-indigo-500"
                    />
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Schedule for Dispatch</span>
                  </label>
                </div>

                {actionChoice === 'schedule' && (
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="px-2.5 py-1 bg-slate-950 border border-white/10 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!editableContent.trim()}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApproveAndSave}
                    disabled={!editableContent.trim() || isOverLimit}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionChoice === 'schedule' ? 'Approve & Schedule Post' : 'Approve & Save Draft'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
