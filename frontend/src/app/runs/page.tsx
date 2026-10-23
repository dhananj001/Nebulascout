'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight,
  Globe,
  Layers,
  Zap
} from 'lucide-react';
import { api, ResearchRun } from '@/lib/api';

export default function RunsPage() {
  const [runs, setRuns] = useState<ResearchRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ResearchRun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const data = await api.getResearchRuns();
      setRuns(data.data || []);
      if (data.data?.length > 0 && !selectedRun) {
        setSelectedRun(data.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'completed_with_warnings':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            Completed w/ Warnings
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Sparkles className="w-3 h-3" />
            Running
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <span>Research Runs & Execution Logs</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Chronological audit trail of automated web discovery, bounded crawler executions, and provider warnings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runs List */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Run History ({runs.length})
          </span>

          <div className="space-y-2">
            {runs.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRun(r)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedRun?.id === r.id
                    ? 'border-amber-500 bg-amber-500/10 shadow-lg'
                    : 'border-white/10 bg-[#121620] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">Run #{r.id}: {r.category_name}</span>
                  {getStatusBadge(r.status)}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{r.location_query || 'Global'}</span>
                  <span className="font-mono">{new Date(r.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-300 pt-1 border-t border-white/5">
                  <span>Candidates: <strong className="text-white">{r.candidates_found}</strong></span>
                  <span>Created: <strong className="text-emerald-400">{r.prospects_created}</strong></span>
                  <span className="capitalize">Mode: {r.mode}</span>
                </div>
              </div>
            ))}

            {runs.length === 0 && !loading && (
              <p className="text-xs text-slate-400 italic py-4">No research runs executed yet.</p>
            )}
          </div>
        </div>

        {/* Selected Run Details & Execution Log */}
        <div className="lg:col-span-2 space-y-4">
          {selectedRun ? (
            <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Research Run #{selectedRun.id}</h2>
                    {getStatusBadge(selectedRun.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Playbook: {selectedRun.category_name} · Location: {selectedRun.location_query || 'Unspecified'}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-400 font-mono">
                  <span>Mode: {selectedRun.mode.toUpperCase()}</span>
                </div>
              </div>

              {/* Warnings Box if any */}
              {selectedRun.warnings && selectedRun.warnings.length > 0 && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Run Warnings / Provider Limitations ({selectedRun.warnings.length})</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {selectedRun.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Execution Steps Log */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Execution Log
                </span>

                <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5 space-y-2 font-mono text-xs max-h-96 overflow-y-auto">
                  {selectedRun.execution_log?.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-slate-300">
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-slate-200">{step.message}</span>
                    </div>
                  ))}

                  {(!selectedRun.execution_log || selectedRun.execution_log.length === 0) && (
                    <span className="text-slate-400 italic">No execution steps logged.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 italic border border-white/10 rounded-xl bg-[#121620]">
              Select a research run to view execution logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
