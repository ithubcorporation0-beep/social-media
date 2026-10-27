'use client';

import React, { useState } from 'react';
import { 
  Database, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface WorkspaceBannerProps {
  isCustomWorkspace: boolean;
  onClearToFresh: () => void;
  onRestoreDemo: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  totalSavedPosts: number;
  totalSavedJobs: number;
}

export default function WorkspaceBanner({
  isCustomWorkspace,
  onClearToFresh,
  onRestoreDemo,
  onExportJson,
  onImportJson,
  totalSavedPosts,
  totalSavedJobs,
}: WorkspaceBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      e.target.value = '';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Status & Description */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Permanent Local Workspace
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Auto-Saved
              </span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                isCustomWorkspace 
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-semibold' 
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              }`}>
                {isCustomWorkspace ? 'Your Real Workspace' : 'Template Loaded'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {totalSavedPosts} posts &bull; {totalSavedJobs} jobs &bull; Never resets on refresh
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
          {confirmClear ? (
            <div className="flex items-center gap-1.5 bg-rose-500/10 p-1 rounded-xl border border-rose-500/30">
              <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium px-1">
                Wipe all items?
              </span>
              <button
                onClick={() => {
                  onClearToFresh();
                  setConfirmClear(false);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                Yes, Start Clean
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              title="Clear all demo sample posts and jobs to start fresh"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clean Slate</span>
            </button>
          )}

          <button
            onClick={onRestoreDemo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Reload the sample demo template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Reset Template</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle workspace tools"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Backup & Restore Controls */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Data stored privately inside your local browser. Zero cloud tracking.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportJson}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Export Backup (.json)</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-purple-500" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
