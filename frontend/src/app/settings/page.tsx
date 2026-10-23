'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Key, 
  Server, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [h, p] = await Promise.all([
        api.getHealth(),
        api.getProviders(),
      ]);
      setHealth(h);
      setProviders(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestResult(null);
    try {
      const res = await api.getHealth();
      setTestResult(`Connection confirmed: Database is ${res.database}, API runtime operational.`);
    } catch (err: any) {
      setTestResult(`Diagnostic error: ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <span>System Settings & Provider Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Server-side provider credentials, SSRF safety guards, database status, and operational controls.
        </p>
      </div>

      {testResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{testResult}</span>
        </div>
      )}

      {/* System Health Overview */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Core System Health</span>
          </div>
          <button
            onClick={handleTestConnection}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test Connection</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-1">Status</span>
            <span className="font-semibold text-emerald-400 capitalize">{health?.status || 'Active'}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-1">Database</span>
            <span className="font-semibold text-emerald-400 capitalize">{health?.database || 'SQLite / Healthy'}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-1">API Version</span>
            <span className="font-mono text-white">{health?.version || '1.0.0'} (v1)</span>
          </div>
          <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[11px] text-slate-400 block mb-1">Environment</span>
            <span className="font-mono text-amber-400">{health?.environment || 'local'}</span>
          </div>
        </div>
      </div>

      {/* AI Provider Section */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
            <Key className="w-4 h-4 text-amber-400" />
            <span>AI Provider Configuration</span>
          </div>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
            providers?.ai?.has_api_key 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {providers?.ai?.has_api_key ? 'API Key Configured' : 'Deterministic Mode (No Key Set)'}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>Configured Provider:</span>
            <strong className="text-white font-mono uppercase">{providers?.ai?.provider || 'Gemini'}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Target Model:</span>
            <span className="text-slate-300 font-mono">{providers?.ai?.model || 'gemini-2.5-flash'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>API Surface:</span>
            <span className="text-slate-300 font-mono">Gemini Interactions API / Structured Output</span>
          </div>

          <div className="p-3 bg-[#0B0D12] border border-white/5 rounded-lg text-slate-400 space-y-1.5 text-[11px]">
            <p className="font-semibold text-slate-300">How to configure your live Gemini API key:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Obtain a Gemini API key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google AI Studio</a>.</li>
              <li>Add <code className="text-white bg-white/10 px-1 py-0.5 rounded">GEMINI_API_KEY=your_key_here</code> to <code className="text-white">backend/.env</code>.</li>
              <li>No frontend reload or build restart required. Secrets remain securely on the server.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Security & SSRF Protection Overview */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider pb-3 border-b border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security & Crawler Egress Policy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-[#0B0D12] border border-white/5 rounded-lg">
            <span className="font-semibold text-white block mb-0.5">Strict SSRF Prevention</span>
            <p className="text-[11px] text-slate-400 leading-tight">
              Blocks loopback (127.0.0.1, ::1), RFC 1918 private networks, link-local, cloud metadata (169.254.169.254), and internal domain suffixes before connecting.
            </p>
          </div>
          <div className="p-3 bg-[#0B0D12] border border-white/5 rounded-lg">
            <span className="font-semibold text-white block mb-0.5">Bounded Resource Limits</span>
            <p className="text-[11px] text-slate-400 leading-tight">
              8-second HTTP timeout, 2MB max response ceiling, single safe redirect validation, and non-executing HTML parsing.
            </p>
          </div>
          <div className="p-3 bg-[#0B0D12] border border-white/5 rounded-lg">
            <span className="font-semibold text-white block mb-0.5">Prompt Injection Boundaries</span>
            <p className="text-[11px] text-slate-400 leading-tight">
              All crawled text is strictly wrapped in passive data tags with explicit system instructions to ignore instructions inside untrusted evidence.
            </p>
          </div>
          <div className="p-3 bg-[#0B0D12] border border-white/5 rounded-lg">
            <span className="font-semibold text-white block mb-0.5">Human Outreach Control</span>
            <p className="text-[11px] text-slate-400 leading-tight">
              Copying does NOT mark as sent. Messages are only recorded as contacted upon explicit operator confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
