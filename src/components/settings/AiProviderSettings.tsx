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
      <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">AI Provider Settings & Credentials</h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Zero Client-Side Leaks
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure Google Gemini, Groq Cloud, or OpenAI keys with server-side validation and live latency tests.
              </p>
            </div>
          </div>
        </div>

        {/* Security Architecture Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 space-y-1">
            <span className="font-semibold text-indigo-300">Strict Secret Isolation Architecture:</span>
            <p className="text-slate-400 leading-relaxed">
              API keys are <span className="text-white font-medium">never included in browser client bundles</span> or exposed in git commits. They are read from server environment variables (<code>.env.local</code>) or securely submitted to server-only API routes via HTTPS POST.
            </p>
          </div>
        </div>
      </div>

      {/* Default Provider Selector Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Default AI Engine</h3>
            <p className="text-xs text-slate-400">Select which provider handles Studio drafting, comment suggestions, and CV tailoring</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
            Active: <span className="text-indigo-400 font-bold uppercase">{defaultProvider}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {configs.map((c) => {
            const isDefault = defaultProvider === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSetDefaultProvider(c.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isDefault
                    ? 'border-indigo-500/60 bg-indigo-600/10 shadow-sm'
                    : 'border-white/5 bg-slate-900/60 hover:border-white/20'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{c.name}</span>
                    {c.id === 'gemini' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold">
                        Free Tier
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {selectedModels[c.id] || c.defaultModel}
                  </p>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  isDefault ? 'border-indigo-500 bg-indigo-600' : 'border-slate-600'
                }`}>
                  {isDefault && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Configuration Cards */}
      <div className="space-y-5">
        {configs.map((config) => {
          const isTesting = testingProvider === config.id;
          const result = testResults[config.id];
          const hasEnteredKey = !!keysInput[config.id]?.trim();

          return (
            <div
              key={config.id}
              className={`glass-panel rounded-2xl p-6 border transition-all space-y-4 ${
                defaultProvider === config.id ? 'border-indigo-500/40 bg-slate-900/70' : 'border-white/5'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{config.name}</h3>
                    {config.id === 'gemini' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Recommended (Free Tier Available)
                      </span>
                    ) : config.id === 'groq' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Ultra-Fast LPU Inference
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Enterprise Reasoning
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {config.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start">
                  {config.id === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium hover:underline"
                    >
                      <span>Get Free Gemini Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {config.id === 'groq' && (
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium hover:underline"
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
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium hover:underline"
                    >
                      <span>OpenAI Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Form Controls: Model Selector & Masked API Key Input */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">Target Model</label>
                  <select
                    value={selectedModels[config.id] || config.defaultModel}
                    onChange={(e) => handleModelChange(config.id, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    {config.availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
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
                      className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey(config.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-indigo-600/20 cursor-pointer"
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
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-white/5 transition-all cursor-pointer"
                    title="Simulate successful credential handshake without an API key"
                  >
                    Test Sandbox Handshake
                  </button>
                </div>

                {/* Status Indicator */}
                <div className="text-xs text-slate-400">
                  {config.status === 'verified' ? (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Active {config.latencyMs && `(${config.latencyMs}ms)`}
                    </span>
                  ) : config.status === 'error' ? (
                    <span className="text-rose-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Validation Failed
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">Awaiting Test</span>
                  )}
                </div>
              </div>

              {/* Test Result Message Box */}
              {result && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1 animate-fade-in ${
                    result.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {result.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      <span>{result.success ? 'Handshake Succeeded' : 'Connection Handshake Failed'}</span>
                    </span>
                    {result.latencyMs && (
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/20 text-white">
                        Latency: {result.latencyMs}ms
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed">{result.message}</p>
                  {result.guidance && (
                    <p className="text-amber-300/90 text-[11px] font-medium pt-1">
                      Remediation: {result.guidance}
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
