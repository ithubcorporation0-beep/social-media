'use client';

import React, { useState } from 'react';
import { ContentItem, PlatformId } from '@/types/dashboard';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Plus, 
  Sparkles,
  Eye
} from 'lucide-react';
import {
  LinkedInIcon,
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  XTwitterIcon
} from '@/components/icons/PlatformIcons';

interface CalendarViewProps {
  items: ContentItem[];
  onSelectItem: (item: ContentItem) => void;
  onOpenCreatePost: () => void;
}

export default function CalendarView({
  items,
  onSelectItem,
  onOpenCreatePost,
}: CalendarViewProps) {
  // Calendar date state: October 2026 (based on project context)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(9);
  };

  // Helper to format days in month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Map scheduled items by day of the month
  const getItemsForDay = (day: number) => {
    return items.filter((item) => {
      const dateStr = item.scheduledFor || item.publishedAt || item.createdAt;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return (
        d.getFullYear() === currentYear &&
        d.getMonth() === currentMonth &&
        d.getDate() === day
      );
    });
  };

  const getPlatformIcon = (platform: PlatformId) => {
    switch (platform) {
      case 'linkedin': return <LinkedInIcon className="w-3 h-3 text-blue-400" />;
      case 'facebook': return <FacebookIcon className="w-3 h-3 text-blue-500" />;
      case 'instagram': return <InstagramIcon className="w-3 h-3 text-pink-400" />;
      case 'youtube': return <YouTubeIcon className="w-3 h-3 text-red-500" />;
      case 'x': return <XTwitterIcon className="w-3 h-3 text-slate-300" />;
      default: return <FileText className="w-3 h-3 text-slate-400" />;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Publishing Calendar</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-medium">
                {monthNames[currentMonth]} {currentYear}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive timeline of scheduled dispatches and publishing milestones
            </p>
          </div>
        </div>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-white/10 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenCreatePost}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Post</span>
          </button>
        </div>
      </div>

      {/* Month Days Grid */}
      <div className="space-y-2">
        {/* Day Name Headers */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* 7x5 Days Matrix */}
        <div className="grid grid-cols-7 gap-2">
          {/* Leading blank days from previous month */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div
              key={`blank-${idx}`}
              className="h-28 rounded-xl bg-slate-950/40 border border-white/[0.02] opacity-25 p-2"
            />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNumber = idx + 1;
            const dayItems = getItemsForDay(dayNumber);
            const isToday = currentMonth === 9 && currentYear === 2026 && dayNumber === 21;

            return (
              <div
                key={`day-${dayNumber}`}
                className={`h-28 rounded-xl p-2 flex flex-col justify-between border transition-all ${
                  isToday
                    ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/50 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold font-mono ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                        : 'text-slate-400'
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {dayItems.length > 0 && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {dayItems.length} post{dayItems.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Post Event Pills */}
                <div className="space-y-1 overflow-y-auto max-h-16 py-1">
                  {dayItems.map((item) => {
                    const isScheduled = item.status === 'scheduled';
                    const isPublished = item.status === 'published';

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectItem(item)}
                        className={`w-full text-left p-1 rounded-md text-[10px] flex items-center gap-1 truncate font-medium border transition-colors ${
                          isScheduled
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20'
                            : isPublished
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-slate-800 text-slate-300 border-white/5 hover:bg-slate-700'
                        }`}
                        title={item.title}
                      >
                        {getPlatformIcon(item.platform)}
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer slot */}
                <div className="text-[9px] text-slate-500">
                  {isToday && <span className="text-indigo-400 font-semibold">• Today</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Compliance Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Scheduled for Dispatch</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Published on Live API</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Unscheduled Draft</span>
          </span>
        </div>

        <div className="text-[11px] text-slate-500 font-mono">
          Click any post pill to view feed mockup preview
        </div>
      </div>
    </div>
  );
}
