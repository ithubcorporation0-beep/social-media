'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  Calendar, 
  LayoutDashboard, 
  Briefcase, 
  Layers, 
  History, 
  BarChart3, 
  Share2, 
  ShieldCheck, 
  Settings2, 
  Plus, 
  Sun, 
  Moon, 
  ArrowRight,
  Command,
  X,
  MessageSquare
} from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onOpenCreatePost: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onOpenCreatePost,
}: CommandPaletteProps) {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions = [
    {
      category: 'Navigation',
      items: [
        { id: 'dashboard', label: 'Dashboard Overview', desc: 'Summary metrics, account status, and pipeline', icon: LayoutDashboard },
        { id: 'studio', label: 'AI Content Studio', desc: 'Generate multi-platform captions with Gemini/Groq/OpenAI', icon: Sparkles },
        { id: 'calendar', label: 'Publishing Calendar', desc: 'Visual timeline and planned post schedule', icon: Calendar },
        { id: 'engagement', label: 'Engagement & Suggested Replies', desc: 'Review comments and approve AI suggested replies', icon: MessageSquare },
        { id: 'content', label: 'Drafts & Scheduled Pipeline', desc: 'Feed previews, post editor, and dispatch queue', icon: Layers },
        { id: 'history', label: 'Publishing History & Audit', desc: 'Verifiable audit logs and external links', icon: History },
        { id: 'jobs', label: 'Job Search & Tracker', desc: 'Search Adzuna, manage applications, and tailor CVs', icon: Briefcase },
        { id: 'analytics', label: 'Analytics & Real Reports', desc: 'Audited post metrics and 1-click CSV export', icon: BarChart3 },
        { id: 'accounts', label: 'Connected Accounts', desc: 'OAuth 2.0 status and permissions breakdown', icon: Share2 },
        { id: 'security', label: 'Security & RLS Vault', desc: 'Zero-secret auditor and Supabase schema', icon: ShieldCheck },
        { id: 'settings', label: 'AI Provider Settings', desc: 'Configure Gemini, Groq, and OpenAI keys safely', icon: Settings2 },
      ]
    },
    {
      category: 'Quick Actions',
      items: [
        { id: 'action-create', label: 'Create New Post', desc: 'Open draft composer with platform validation', icon: Plus, isAction: true },
        { id: 'action-theme', label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, desc: `Currently using ${theme} theme`, icon: theme === 'dark' ? Sun : Moon, isAction: true },
      ]
    }
  ];

  // Flattened and filtered list
  const filteredItems = actions.flatMap(cat => 
    cat.items
      .filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase()) || 
        item.desc.toLowerCase().includes(query.toLowerCase())
      )
      .map(item => ({ ...item, category: cat.category }))
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset selected index when query changes
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleExecute(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  const handleExecute = (item: any) => {
    if (item.id === 'action-create') {
      onClose();
      onOpenCreatePost();
    } else if (item.id === 'action-theme') {
      toggleTheme();
      onClose();
    } else {
      onSelectTab(item.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Menu"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-white/10">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command, search views, or hit Esc..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  onClick={() => handleExecute(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold text-xs sm:text-sm truncate ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                        {item.label}
                      </p>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-3 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.category}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center space-y-2">
              <Command className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">No matching commands</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Try searching for &quot;Studio&quot;, &quot;Jobs&quot;, &quot;Post&quot;, or &quot;Theme&quot;</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="font-mono text-[10px]">Quick Command Hub</span>
        </div>
      </div>
    </div>
  );
}
