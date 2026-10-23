'use client';

import { useState, useEffect } from 'react';
import { 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  MessageSquare, 
  Plus, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api, FollowUp, Prospect } from '@/lib/api';
import { ProspectDetailModal } from '@/components/ProspectDetailModal';

export default function OutreachPage() {
  const [followUpsData, setFollowUpsData] = useState<{
    counts: { overdue: number; due_today: number; upcoming: number; total_pending: number };
    overdue: FollowUp[];
    due_today: FollowUp[];
    upcoming: FollowUp[];
    completed: FollowUp[];
  } | null>(null);

  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = async () => {
    setLoading(true);
    try {
      const data = await api.getFollowUps('all');
      setFollowUpsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await api.updateFollowUp(id, { status: 'completed' });
      loadFollowUps();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-400" />
            <span>Outreach Execution & Follow-Up Reminders</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Conservative follow-up schedule and human-confirmed message workflows. Never automated without permission.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#121620] p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Follow-Ups ({followUpsData?.counts.total_pending ?? 0})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'completed'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed History
          </button>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div className="space-y-6">
          {/* 1. OVERDUE FOLLOW-UPS */}
          {followUpsData && followUpsData.overdue.length > 0 && (
            <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Overdue Action Items ({followUpsData.overdue.length})</span>
              </div>

              <div className="space-y-2">
                {followUpsData.overdue.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setSelectedProspectId(f.prospect_id)}
                    className="p-3.5 rounded-lg bg-[#121620] border border-rose-500/20 hover:border-rose-400 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white">
                          {f.prospect?.business_name || 'Prospect'}
                        </span>
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                          Due {f.due_date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{f.reason}</p>
                    </div>

                    <button
                      onClick={(e) => handleComplete(e, f.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. DUE TODAY */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Due Today ({followUpsData?.due_today.length ?? 0})</span>
            </div>

            <div className="space-y-2">
              {followUpsData?.due_today.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedProspectId(f.prospect_id)}
                  className="p-3.5 rounded-lg bg-[#0B0D12] border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-xs text-white">
                      {f.prospect?.business_name || 'Prospect'}
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">{f.reason}</p>
                  </div>

                  <button
                    onClick={(e) => handleComplete(e, f.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Done</span>
                  </button>
                </div>
              ))}

              {(!followUpsData?.due_today || followUpsData.due_today.length === 0) && (
                <p className="text-xs text-slate-400 italic py-2">No follow-ups scheduled for today.</p>
              )}
            </div>
          </div>

          {/* 3. UPCOMING SCHEDULE */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Upcoming Cadence ({followUpsData?.upcoming.length ?? 0})</span>
            </div>

            <div className="space-y-2">
              {followUpsData?.upcoming.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setSelectedProspectId(f.prospect_id)}
                  className="p-3.5 rounded-lg bg-[#0B0D12] border border-white/5 hover:border-white/20 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">
                        {f.prospect?.business_name || 'Prospect'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {f.due_date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{f.reason}</p>
                  </div>

                  <button
                    onClick={(e) => handleComplete(e, f.id)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium rounded transition-colors"
                  >
                    Mark Done
                  </button>
                </div>
              ))}

              {(!followUpsData?.upcoming || followUpsData.upcoming.length === 0) && (
                <p className="text-xs text-slate-400 italic py-2">No upcoming follow-ups queued.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* COMPLETED HISTORY */
        <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Completed Follow-Up History
          </span>
          <div className="space-y-2">
            {followUpsData?.completed.map((f) => (
              <div key={f.id} className="p-3 rounded-lg bg-[#0B0D12] border border-white/5 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">{f.prospect?.business_name}</span>
                  <p className="text-slate-400 mt-0.5">{f.reason}</p>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Completed {f.completed_at ? new Date(f.completed_at).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prospect Inspection Drawer */}
      <ProspectDetailModal
        prospectId={selectedProspectId}
        isOpen={Boolean(selectedProspectId)}
        onClose={() => setSelectedProspectId(null)}
        onProspectUpdated={loadFollowUps}
      />
    </div>
  );
}
