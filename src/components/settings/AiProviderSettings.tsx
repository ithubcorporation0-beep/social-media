'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  ExternalLink, 
  Radio, 
  Cpu, 
  Server,
  Zap,
  Check,
  X
} from 'lucide-react';
import { AiProviderConfig, AiProviderId } from '@/types/dashboard';

interface AiProviderSettingsProps {
  configs: AiProviderConfig[];
  defaultProvider: AiProviderId;
  onSetDefaultProvider: (provider: AiProviderId) => void;
  onUpdateConfig: (config: AiProviderConfig) => void;
}

export default function AiProviderSettings({
  configs,
  defaultProvider,
  onSetDefaultProvider,
  onUpdateConfig,
}: AiProviderSettingsProps) {
  // Input fields for keys (masked in UI, sent to server route only)
  const [keysInput, setKeysInput] = useState<{ [key in AiProviderId]?: string }>({});
  const [showKey, setShowKey] = useState<{ [key in AiProviderId]?: boolean }>({});
  const [selectedModels, setSelectedModels] = useState<{ [key in AiProviderId]?: string }>({
    gemini: 'gemini-2.0-flash',
    groq: 'llama-3.3-70b-versatile',
    openai: 'gpt-4o-mini',
  });

  // Testing states
  const [testingProvider, setTestingProvider] = useState<AiProviderId | null>(null);
  const [testResults, setTestResults] = useState<{
    [key in AiProviderId]?: {
      success: boolean;
      message: string;
      latencyMs?: number;
      guidance?: string;
      error?: string;
      source?: string;
    };
  }>({});

  const toggleShowKey = (id: AiProviderId) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleKeyChange = (id: AiProviderId, val: string) => {
    setKeysInput((prev) => ({ ...prev, [id]: val }));
  };

  const handleModelChange = (id: AiProviderId, model: string) => {
    setSelectedModels((prev) => ({ ...prev, [id]: model }));
  };

  // Test Connection
  const handleTestConnection = async (id: AiProviderId, useSandboxKey = false) => {
    setTestingProvider(id);
    setTestResults((prev) => ({ ...prev, [id]: undefined }));

    const keyToSubmit = useSandboxKey ? 'SIMULATED_TEST_KEY' : keysInput[id];
    const modelToTest = selectedModels[id] || (id === 'gemini' ? 'gemini-2.0-flash' : id === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini');

    try {
      const res = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: id,
          apiKey: keyToSubmit,
          model: modelToTest,
        }),
      });

      const data = await res.json();

      setTestResults((prev) => ({
        ...prev,
        [id]: {
          success: data.success,
          message: data.message || (data.success ? 'Connection verified successfully.' : data.error),
          latencyMs: data.latencyMs,
          guidance: data.guidance,
          error: data.error,
          source: data.source,
        },
      }));

      // Update parent config status
      const targetConfig = configs.find((c) => c.id === id);
      if (targetConfig) {
        onUpdateConfig({
          ...targetConfig,
          status: data.success ? 'verified' : 'error',
          lastTestedAt: new Date().toISOString(),
          latencyMs: data.latencyMs,
          errorMessage: data.success ? undefined : data.error,
        });
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [id]: {
          success: false,
          message: 'Network error calling connection validation endpoint.',
          error: err.message,
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Security Architecture Guarantee */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">AI Provider Settings & Credentials</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Zero Client-Side Leaks
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure Google Gemini, Groq, and OpenAI keys safely. All credentials reside exclusively on the server.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-mono text-[11px]">Server Environment Isolated</span>
            </div>
          </div>
        </div>

        {/* Security Architecture Notice */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Server-Side Secret Isolation Architecture</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            API keys are NEVER sent to the client bundle or saved in browser local storage. They are loaded securely from <code>.env.local</code> or encrypted with AES-256-GCM.
          </p>
        </div>
      </div>

      {/* Provider Configs Cards */}
      <div className="space-y-4">
        {configs.map((config) => {
          const isDefault = defaultProvider === config.id;
          const isTesting = testingProvider === config.id;
          const result = testResults[config.id];

          return (
            <div
              key={config.id}
              className={`glass-panel rounded-2xl p-6 border transition-all space-y-4 shadow-sm ${
                isDefault
                  ? 'border-indigo-500/40 ring-1 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              {/* Card Header: Provider Title, Badge, Default Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shrink-0">
                    {config.id === 'gemini' ? '✨' : config.id === 'groq' ? '⚡' : '🧠'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">{config.name}</h2>
                      {isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold">
                          DEFAULT ACTIVE ENGINE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{config.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {config.id === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Get Free Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {config.id === 'groq' && (
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>Get Groq Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {config.id === 'openai' && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>OpenAI Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {!isDefault && (
                    <button
                      onClick={() => onSetDefaultProvider(config.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>

              {/* Form Controls: Model Selector & Masked Key */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Model</label>
                  <select
                    value={selectedModels[config.id] || config.defaultModel}
                    onChange={(e) => handleModelChange(config.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
                  >
                    {config.availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>API Key (Restricted to Server-Side Execution)</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {config.id === 'gemini' ? 'AIzaSy...' : config.id === 'groq' ? 'gsk_...' : 'sk-...'}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showKey[config.id] ? 'text' : 'password'}
                      value={keysInput[config.id] || ''}
                      onChange={(e) => handleKeyChange(config.id, e.target.value)}
                      placeholder={
                        process.env[`${config.id.toUpperCase()}_API_KEY`]
                          ? '•••••••••••••••• (Loaded from .env.local)'
                          : `Paste ${config.name} API key for live verification...`
                      }
                      className="w-full px-3 py-2 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(config.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
                      title={showKey[config.id] ? 'Hide Key' : 'Reveal Key'}
                    >
                      {showKey[config.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Test Connection & Sandbox Demo */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(config.id, false)}
                    disabled={isTesting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-600/20 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying Connection...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Test Live Connection</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleTestConnection(config.id, true)}
                    disabled={isTesting}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-white/5 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                    title="Simulate successful credential handshake without an API key"
                  >
                    Test Sandbox Handshake
                  </button>
                </div>

                {/* Status Indicator */}
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {config.status === 'verified' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Active {config.latencyMs && `(${config.latencyMs}ms)`}
                    </span>
                  ) : config.status === 'error' ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Validation Failed
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">Awaiting Test</span>
                  )}
                </div>
              </div>

              {/* Real-time Handshake Result Callout */}
              {result && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
                    result.success
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                      <span>{result.success ? 'Handshake Succeeded' : 'Handshake Failed'}</span>
                    </span>
                    {result.latencyMs && <span className="font-mono text-[11px]">{result.latencyMs}ms latency</span>}
                  </div>
                  <p className="leading-relaxed">{result.message}</p>
                  {result.guidance && (
                    <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-black/20 p-2 rounded-lg">
                      Fix: {result.guidance}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
