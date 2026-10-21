'use client';

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Building, 
  Trash2, 
  Copy, 
  Check, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  RefreshCw,
  Globe,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';
import { JobApplication, JobSearchResult, ApplicationStatus } from '@/types/dashboard';

interface JobTrackerProps {
  applications: JobApplication[];
  onAddApplication: (app: Omit<JobApplication, 'id' | 'createdAt'>) => void;
  onUpdateApplication: (app: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
}

export default function JobTracker({
  applications,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
}: JobTrackerProps) {
  // Top Tabs: 'pipeline' vs 'search'
  const [activeView, setActiveView] = useState<'pipeline' | 'search'>('pipeline');

  // Search State
  const [searchQuery, setSearchQuery] = useState('Full Stack Engineer');
  const [searchLocation, setSearchLocation] = useState('Remote');
  const [searchCountry, setSearchCountry] = useState('us');
  const [searchResults, setSearchResults] = useState<JobSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchProvider, setSearchProvider] = useState<string>('Adzuna API');
  const [searchNotice, setSearchNotice] = useState<string>('');

  // Pipeline Filter & View
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [pipelineLayout, setPipelineLayout] = useState<'kanban' | 'list'>('kanban');

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newLocation, setNewLocation] = useState('Remote');
  const [newSalary, setNewSalary] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSource, setNewSource] = useState<'adzuna' | 'indeed' | 'linkedin' | 'direct'>('adzuna');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('saved');
  const [newDeadline, setNewDeadline] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // AI Tailor Modal State
  const [tailorModalOpen, setTailorModalOpen] = useState(false);
  const [selectedAppForTailor, setSelectedAppForTailor] = useState<JobApplication | null>(null);
  const [tailorLanguage, setTailorLanguage] = useState<'english' | 'roman_urdu'>('english');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResults, setTailoredResults] = useState<{
    cvSummary?: string;
    coverLetter?: string;
    recruiterMessage?: string;
    provider?: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Execute job search on mount or query change
  const handleSearchJobs = async () => {
    setIsSearching(true);
    setSearchNotice('');
    try {
      const res = await fetch(
        `/api/jobs/search?what=${encodeURIComponent(searchQuery)}&where=${encodeURIComponent(
          searchLocation
        )}&country=${searchCountry}`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
        setSearchProvider(data.provider || 'Adzuna Official API');
        if (data.notice) {
          setSearchNotice(data.notice);
        }
      }
    } catch (err) {
      console.error('Job search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (activeView === 'search' && searchResults.length === 0) {
      handleSearchJobs();
    }
  }, [activeView]);

  // Save Adzuna Search Result directly into personal Pipeline
  const handleSaveSearchResult = (job: JobSearchResult) => {
    onAddApplication({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salaryMin && job.salaryMax ? `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k` : undefined,
      url: job.redirectUrl,
      source: 'adzuna',
      status: 'saved',
      descriptionSnippet: job.description,
      isDemo: true,
      notes: `Saved from Adzuna Official Search on ${new Date().toLocaleDateString()}`,
    });
    setActiveView('pipeline');
  };

  // Submit Manual External Job
  const handleSubmitManualJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    onAddApplication({
      title: newTitle.trim(),
      company: newCompany.trim(),
      location: newLocation.trim() || 'Remote',
      salary: newSalary.trim() || undefined,
      url: newUrl.trim() || 'https://www.linkedin.com/jobs',
      source: newSource,
      status: newStatus,
      deadline: newDeadline || undefined,
      notes: newNotes.trim() || undefined,
      isDemo: true,
    });

    // Reset Form
    setNewTitle('');
    setNewCompany('');
    setNewLocation('Remote');
    setNewSalary('');
    setNewUrl('');
    setNewNotes('');
    setNewDeadline('');
    setIsAddModalOpen(false);
  };

  // Trigger AI Tailoring
  const handleOpenTailorModal = (app: JobApplication) => {
    setSelectedAppForTailor(app);
    setTailorLanguage('english');
    setTailoredResults(
      app.tailoredCvSummary || app.coverLetter || app.recruiterMessage
        ? {
            cvSummary: app.tailoredCvSummary,
            coverLetter: app.coverLetter,
            recruiterMessage: app.recruiterMessage,
            provider: 'Previously Generated Draft',
          }
        : null
    );
    setTailorModalOpen(true);
  };

  const handleGenerateTailoredDocs = async () => {
    if (!selectedAppForTailor) return;
    setIsTailoring(true);
    try {
      const res = await fetch('/api/jobs/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedAppForTailor.title,
          company: selectedAppForTailor.company,
          description: selectedAppForTailor.descriptionSnippet || selectedAppForTailor.notes,
          language: tailorLanguage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTailoredResults(data);

        // Auto-save generated drafts into the application object
        onUpdateApplication({
          ...selectedAppForTailor,
          tailoredCvSummary: data.cvSummary,
          coverLetter: data.coverLetter,
          recruiterMessage: data.recruiterMessage,
          status: selectedAppForTailor.status === 'saved' ? 'drafting' : selectedAppForTailor.status,
        });
      }
    } catch (err) {
      console.error('Tailor error:', err);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper date countdown
  const getFollowUpBadge = (dateStr?: string) => {
    if (!dateStr) return null;
    const target = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <Clock className="w-3 h-3" /> Overdue ({Math.abs(diffDays)}d)
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
          <Clock className="w-3 h-3" /> Follow-up Today
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Clock className="w-3 h-3" /> Follow-up in {diffDays}d
        </span>
      );
    }
  };

  const getInterviewBadge = (dateStr?: string) => {
    if (!dateStr) return null;
    const dateObj = new Date(dateStr);
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
        <Calendar className="w-3 h-3 text-purple-400" /> Interview: {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </span>
    );
  };

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  // Kanban status columns
  const kanbanColumns: { status: ApplicationStatus; label: string; count: number; color: string }[] = [
    { status: 'saved', label: 'Saved / Research', count: applications.filter(a => a.status === 'saved').length, color: 'border-slate-700/50 bg-slate-900/40 text-slate-300' },
    { status: 'drafting', label: 'Drafting Docs', count: applications.filter(a => a.status === 'drafting').length, color: 'border-amber-500/20 bg-amber-500/5 text-amber-300' },
    { status: 'applied', label: 'Applied', count: applications.filter(a => a.status === 'applied').length, color: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-300' },
    { status: 'interviewing', label: 'Interviewing', count: applications.filter(a => a.status === 'interviewing').length, color: 'border-purple-500/20 bg-purple-500/5 text-purple-300' },
    { status: 'offered', label: 'Offer Received', count: applications.filter(a => a.status === 'offered').length, color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' },
    { status: 'rejected', label: 'Closed / Archived', count: applications.filter(a => a.status === 'rejected').length, color: 'border-rose-500/20 bg-rose-500/5 text-rose-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Anti-Scraping / Official Integration Notice */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Job Search & Application Tracker
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Adzuna Official API
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  Search authorized global feeds, track deadlines and interview dates, and generate tailored CV summaries.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add External Application</span>
            </button>
          </div>
        </div>

        {/* Official API Policy & Indeed Compliance Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-amber-300">Official Access & Compliance Guarantee:</span>
            <p className="text-slate-400 leading-relaxed">
              Indeed does not provide unrestricted public job search or auto-submit APIs (enterprise ATS partnership is strictly required). Scraping Indeed or LinkedIn violates their Terms of Service and risks legal action. SocialHub AI connects directly to the <span className="text-white font-medium">official Adzuna REST API</span> for compliant search and provides a safe personal tracker for external job links you manually add. Applications are <span className="text-white font-medium">never submitted automatically</span> without your explicit approval.
            </p>
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Bar: Pipeline vs Live Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveView('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'pipeline'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>My Application Pipeline ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveView('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'search'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Live Job Search (Adzuna Engine)</span>
          </button>
        </div>

        {activeView === 'pipeline' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/5 text-xs text-slate-400">
              <button
                onClick={() => setPipelineLayout('kanban')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  pipelineLayout === 'kanban' ? 'bg-white/10 text-white' : 'hover:text-slate-200'
                }`}
              >
                Kanban Board
              </button>
              <button
                onClick={() => setPipelineLayout('list')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  pipelineLayout === 'list' ? 'bg-white/10 text-white' : 'hover:text-slate-200'
                }`}
              >
                List View
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'all')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Stages ({applications.length})</option>
              <option value="saved">Saved</option>
              <option value="drafting">Drafting Docs</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offered">Offered</option>
              <option value="rejected">Closed</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: MY APPLICATION PIPELINE */}
      {activeView === 'pipeline' && (
        <div className="space-y-6">
          {filteredApplications.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 space-y-3">
              <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No applications in this stage</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Search open listings with Adzuna or click &quot;Add External Application&quot; to organize your pipeline.
              </p>
              <button
                onClick={() => setActiveView('search')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Live Listings</span>
              </button>
            </div>
          ) : pipelineLayout === 'kanban' ? (
            /* Kanban Board Columns */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
              {kanbanColumns.map((col) => {
                const colItems = applications.filter((a) => a.status === col.status);
                return (
                  <div
                    key={col.status}
                    className={`rounded-2xl border p-3 flex flex-col gap-3 min-h-[400px] ${col.color}`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-xs font-bold tracking-tight">{col.label}</span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 text-white">
                        {colItems.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1">
                      {colItems.map((app) => (
                        <div
                          key={app.id}
                          className="glass-panel rounded-xl p-3.5 border border-white/10 space-y-2.5 hover:border-white/20 transition-all bg-slate-900/80 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                                {app.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 text-slate-500" />
                                <span className="font-medium text-slate-300 truncate">{app.company}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => onDeleteApplication(app.id)}
                              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Delete application"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate max-w-[100px]">{app.location}</span>
                            </span>
                            {app.salary && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                                {app.salary}
                              </span>
                            )}
                          </div>

                          {/* Countdown Badges */}
                          <div className="space-y-1">
                            {getInterviewBadge(app.interviewDate)}
                            {getFollowUpBadge(app.followUpDate)}
                          </div>

                          {/* Tailored Doc Status */}
                          {(app.tailoredCvSummary || app.coverLetter) && (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>AI Tailored Docs Ready</span>
                            </div>
                          )}

                          {/* Card Action Buttons */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                            <button
                              onClick={() => handleOpenTailorModal(app)}
                              className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-indigo-500/10 cursor-pointer"
                              title="Generate tailored CV, cover letter, and message"
                            >
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span>Tailor</span>
                            </button>

                            <a
                              href={app.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
                              title="Review and apply on official website"
                            >
                              <span>Apply</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>

                            {/* Status changer select */}
                            <select
                              value={app.status}
                              onChange={(e) =>
                                onUpdateApplication({
                                  ...app,
                                  status: e.target.value as ApplicationStatus,
                                })
                              }
                              className="text-[10px] bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none"
                            >
                              <option value="saved">Saved</option>
                              <option value="drafting">Draft</option>
                              <option value="applied">Applied</option>
                              <option value="interviewing">Interview</option>
                              <option value="offered">Offer</option>
                              <option value="rejected">Closed</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="glass-panel rounded-2xl p-4 border border-white/5 hover:border-white/15 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{app.title}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 uppercase">
                        {app.source}
                      </span>
                      {app.salary && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          {app.salary}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-300 font-medium">{app.company}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{app.location}</span>
                      </span>
                    </div>
                    {app.notes && (
                      <p className="text-xs text-slate-400 italic line-clamp-1">
                        &quot;{app.notes}&quot;
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {getInterviewBadge(app.interviewDate)}
                      {getFollowUpBadge(app.followUpDate)}
                      {(app.tailoredCvSummary || app.coverLetter) && (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> AI Tailored Docs
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={app.status}
                      onChange={(e) =>
                        onUpdateApplication({
                          ...app,
                          status: e.target.value as ApplicationStatus,
                        })
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="saved">Stage: Saved</option>
                      <option value="drafting">Stage: Drafting Docs</option>
                      <option value="applied">Stage: Applied</option>
                      <option value="interviewing">Stage: Interviewing</option>
                      <option value="offered">Stage: Offer Received</option>
                      <option value="rejected">Stage: Closed</option>
                    </select>

                    <button
                      onClick={() => handleOpenTailorModal(app)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Tailor CV</span>
                    </button>

                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                    >
                      <span>Review & Apply</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>

                    <button
                      onClick={() => onDeleteApplication(app.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-all cursor-pointer"
                      title="Delete application"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: LIVE JOB SEARCH (ADZUNA ENGINE) */}
      {activeView === 'search' && (
        <div className="space-y-6">
          {/* Search Controls Card */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-medium text-slate-300">Job Title or Keyword</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g. Next.js Developer, AI Engineer, Full-Stack"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchJobs()}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="e.g. Remote, New York, London"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchJobs()}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Country</label>
                <div className="flex gap-2">
                  <select
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="us">United States (us)</option>
                    <option value="gb">United Kingdom (gb)</option>
                    <option value="ca">Canada (ca)</option>
                    <option value="au">Australia (au)</option>
                    <option value="de">Germany (de)</option>
                    <option value="in">India (in)</option>
                  </select>

                  <button
                    onClick={handleSearchJobs}
                    disabled={isSearching}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Search Provider: <span className="text-white font-medium">{searchProvider}</span></span>
              </span>
              {searchNotice && (
                <span className="text-amber-400 font-mono text-[10px]">
                  {searchNotice}
                </span>
              )}
            </div>
          </div>

          {/* Search Results Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Authorized Job Results ({searchResults.length})
              </h3>
              <p className="text-xs text-slate-400">
                Official listings with direct employer redirect URLs
              </p>
            </div>

            {isSearching ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-300">Querying Adzuna REST API endpoint...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 space-y-3">
                <Search className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300">No jobs matched your query. Try broadening your keywords or location.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((job) => {
                  const isAlreadySaved = applications.some(
                    (a) => a.title.toLowerCase() === job.title.toLowerCase() && a.company.toLowerCase() === job.company.toLowerCase()
                  );

                  return (
                    <div
                      key={job.id}
                      className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-white/15 transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-white leading-snug">{job.title}</h4>
                            <p className="text-xs text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <span>{job.company}</span>
                            </p>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                            Verified Feed
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{job.location}</span>
                          </span>
                          {job.salaryMin && job.salaryMax && (
                            <span className="flex items-center gap-1 text-emerald-400 font-mono">
                              <DollarSign className="w-3 h-3" />
                              <span>
                                ${(job.salaryMin / 1000).toFixed(0)}k - ${(job.salaryMax / 1000).toFixed(0)}k
                              </span>
                            </span>
                          )}
                          {job.contractTime && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 text-[11px] uppercase">
                              {job.contractTime.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                        <a
                          href={job.redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                        >
                          <span>Review & Apply</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>

                        {isAlreadySaved ? (
                          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> In Pipeline
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSaveSearchResult(job)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Save to Tracker</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD EXTERNAL APPLICATION MANUALLY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel rounded-2xl border border-white/10 p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Add External Job Application</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitManualJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="e.g. Stripe, OpenAI, Vercel"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco, London"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Salary / Compensation</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="e.g. $140k - $165k"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Listing URL (Official Job Link)</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://company.com/careers/job-id or Indeed / LinkedIn link"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Source Platform</label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="adzuna">Adzuna</option>
                    <option value="indeed">Indeed (Manual)</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="direct">Company Direct</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Current Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="saved">Saved / Researching</option>
                    <option value="drafting">Drafting Documents</option>
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offered">Offer Received</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Application Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Notes & Key Contacts</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Recruiter name, specific tech stack notes, referral information..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20"
                >
                  Save to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: AI CAREER ASSISTANT & DOCUMENT TAILOR */}
      {tailorModalOpen && selectedAppForTailor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel rounded-2xl border border-white/15 p-6 max-w-2xl w-full space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">AI Career Document Drafter</h3>
                  <p className="text-xs text-slate-400">
                    Tailored for: <span className="text-white font-semibold">{selectedAppForTailor.title}</span> at <span className="text-indigo-400 font-semibold">{selectedAppForTailor.company}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTailorModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language and Generation Controls */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-slate-300">Drafting Language:</label>
                <div className="flex rounded-lg bg-slate-950 p-1 border border-white/10">
                  <button
                    onClick={() => setTailorLanguage('english')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      tailorLanguage === 'english'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setTailorLanguage('roman_urdu')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      tailorLanguage === 'roman_urdu'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Roman Urdu
                  </button>
                </div>
              </div>

              <button
                onClick={handleGenerateTailoredDocs}
                disabled={isTailoring}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                {isTailoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Tailored Documents...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{tailoredResults ? 'Regenerate Drafts' : 'Generate Tailored Drafts'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Generated Output Tabs / Sections */}
            {tailoredResults && (
              <div className="space-y-4">
                {/* 1. Tailored CV Summary */}
                <div className="glass-panel rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Tailored CV Highlights (Tailored to Role)
                    </span>
                    <button
                      onClick={() => handleCopyText(tailoredResults.cvSummary || '', 'cv')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {copiedKey === 'cv' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'cv' ? 'Copied!' : 'Copy Highlights'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap bg-slate-950/70 p-3 rounded-lg border border-white/5 leading-relaxed">
                    {tailoredResults.cvSummary}
                  </pre>
                </div>

                {/* 2. Custom Cover Letter */}
                <div className="glass-panel rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      Custom Cover Letter Draft
                    </span>
                    <button
                      onClick={() => handleCopyText(tailoredResults.coverLetter || '', 'cover')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {copiedKey === 'cover' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'cover' ? 'Copied!' : 'Copy Letter'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap bg-slate-950/70 p-3 rounded-lg border border-white/5 leading-relaxed max-h-48 overflow-y-auto">
                    {tailoredResults.coverLetter}
                  </pre>
                </div>

                {/* 3. Recruiter Outreach Message */}
                <div className="glass-panel rounded-xl p-4 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                      Recruiter Direct Outreach Message (~80 words)
                    </span>
                    <button
                      onClick={() => handleCopyText(tailoredResults.recruiterMessage || '', 'msg')}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      {copiedKey === 'msg' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'msg' ? 'Copied!' : 'Copy Message'}</span>
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap bg-slate-950/70 p-3 rounded-lg border border-white/5 leading-relaxed">
                    {tailoredResults.recruiterMessage}
                  </pre>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2">
                  <span>Engine: <span className="text-white font-medium">{tailoredResults.provider || 'SocialHub Career AI'}</span></span>
                  <span className="text-emerald-400 font-medium">Auto-saved to application record</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <a
                href={selectedAppForTailor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              >
                <span>Open Official Application Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <button
                onClick={() => setTailorModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
