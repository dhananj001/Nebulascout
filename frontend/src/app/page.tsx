'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Send, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight, 
  AlertCircle, 
  Activity,
  Layers,
  Calendar,
  Globe,
  ChevronRight
} from 'lucide-react';
import { api, AnalyticsData, Prospect } from '@/lib/api';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ProspectDetailModal } from '@/components/ProspectDetailModal';

export default function OverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentProspects, setRecentProspects] = useState<Prospect[]>([]);
  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, prospectsData] = await Promise.all([
        api.getAnalytics(),
        api.getProspects({ per_page: 5 }),
      ]);
      setAnalytics(analyticsData);
      setRecentProspects(prospectsData.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const summary = analytics?.summary;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Prospect Intelligence & Pipeline</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Environment
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time evidence synthesis, deterministic scoring, and human-confirmed outreach.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Candidates</span>
          </Link>
          <Link
            href="/prospects"
            className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs rounded-md border border-white/10 transition-colors"
          >
            <span>View All Prospects</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total & Qualified */}
        <div className="p-4 rounded-xl bg-[#121620] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Qualified Leads</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {summary?.qualified_prospects ?? 0}
            </span>
            <span className="text-xs text-slate-400">of {summary?.total_prospects ?? 0} total</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">
              {summary?.total_prospects ? Math.round(((summary.qualified_prospects / summary.total_prospects) * 100)) : 0}%
            </span>
            <span>qualification rate</span>
          </div>
        </div>

        {/* Confirmed Sent */}
        <div className="p-4 rounded-xl bg-[#121620] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Confirmed Sent</span>
            <Send className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {summary?.confirmed_sent ?? 0}
            </span>
            <span className="text-xs text-slate-400">outreach messages</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <span>{summary?.drafts_generated ?? 0} drafts prepared</span>
          </div>
        </div>

        {/* Reply Rate */}
        <div className="p-4 rounded-xl bg-[#121620] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Reply Rate</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {summary?.reply_rate_percent ?? 0}%
            </span>
            <span className="text-xs text-slate-400">
              ({summary?.replied ?? 0} replies)
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 font-mono">
            Denominator: confirmed sends
          </div>
        </div>

        {/* Follow-ups Due */}
        <div className="p-4 rounded-xl bg-[#121620] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Follow-Ups Due</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">
              {analytics?.follow_ups?.pending ?? 0}
            </span>
            {analytics?.follow_ups?.overdue ? (
              <span className="text-xs text-rose-400 font-medium">
                ({analytics.follow_ups.overdue} overdue)
              </span>
            ) : (
              <span className="text-xs text-slate-400">pending</span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            <Link href="/outreach" className="text-amber-400 hover:underline flex items-center gap-1">
              <span>Open follow-up queue</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pipeline Health & High-Priority Prospects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pipeline Stage Bar */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Pipeline Stage Progression</h2>
              <Link href="/pipeline" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                <span>Kanban Board</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { stage: 'Discovered', count: analytics?.pipeline_stages?.discovered ?? 0 },
                { stage: 'Qualified', count: analytics?.pipeline_stages?.qualified ?? 0 },
                { stage: 'Draft Ready', count: analytics?.pipeline_stages?.draft_ready ?? 0 },
                { stage: 'Contacted', count: analytics?.pipeline_stages?.contacted ?? 0 },
                { stage: 'Replied', count: analytics?.pipeline_stages?.replied ?? 0 },
                { stage: 'Meeting', count: analytics?.pipeline_stages?.meeting_booked ?? 0 },
                { stage: 'Proposal', count: analytics?.pipeline_stages?.proposal_sent ?? 0 },
                { stage: 'Won', count: analytics?.pipeline_stages?.won ?? 0 },
              ].map((s) => (
                <div key={s.stage} className="p-2.5 rounded bg-[#0B0D12] border border-white/5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{s.stage}</span>
                  <p className="text-base font-bold text-white mt-0.5">{s.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Researched Prospects */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recent Discovered Prospects</h2>
              <Link href="/prospects" className="text-xs text-slate-400 hover:text-white">
                View all ({summary?.total_prospects ?? 0})
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentProspects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProspectId(p.id)}
                  className="p-3.5 rounded-lg bg-[#0B0D12] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {p.business_name}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-slate-300">
                        {p.category?.name || 'Unassigned'}
                      </span>
                      {p.location && (
                        <span className="text-[11px] text-slate-400">· {p.location}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {p.normalized_domain && (
                        <span className="text-slate-400">{p.normalized_domain}</span>
                      )}
                      {p.instagram_handle && (
                        <span className="text-pink-400">@{p.instagram_handle}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ScoreBadge label="Fit" score={p.fit_score} />
                    <ScoreBadge label="Opp" score={p.opportunity_score} />
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {p.stage.replace('_', ' ')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}

              {recentProspects.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                  <p>No prospects researched yet.</p>
                  <Link href="/discover" className="inline-block px-3 py-1.5 bg-amber-500 text-slate-950 font-medium rounded text-xs">
                    Run First Discovery
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Activity & AI Metrics */}
        <div className="space-y-6">
          {/* AI Usage Card */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">AI Operations</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Gemini 2.5
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Model Invocations:</span>
                <span className="font-mono text-white font-bold">{analytics?.ai_usage?.total_calls ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Total Tokens Processed:</span>
                <span className="font-mono text-white">{(analytics?.ai_usage?.total_tokens ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Cost:</span>
                <span className="font-mono text-amber-400 font-bold">${(analytics?.ai_usage?.estimated_spend_usd ?? 0).toFixed(4)}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-2 border-t border-white/5">
              Task-bounded specialist workflows with prompt injection controls.
            </p>
          </div>

          {/* Activity Stream */}
          <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Recent Activity Feed
            </span>

            <div className="space-y-3">
              {analytics?.recent_activity?.slice(0, 7).map((act) => (
                <div key={act.id} className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="font-medium text-white truncate max-w-[180px]">
                      {act.prospect?.business_name || 'Prospect'}
                    </span>
                    <span className="text-[10px] font-mono">
                      {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {act.description}
                  </p>
                </div>
              ))}

              {(!analytics?.recent_activity || analytics.recent_activity.length === 0) && (
                <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prospect Detail Drawer */}
      <ProspectDetailModal
        prospectId={selectedProspectId}
        isOpen={Boolean(selectedProspectId)}
        onClose={() => setSelectedProspectId(null)}
        onProspectUpdated={loadData}
      />
    </div>
  );
}
