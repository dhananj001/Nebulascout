'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  DollarSign, 
  CheckCircle2, 
  Send, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { api, AnalyticsData } from '@/lib/api';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <span>Analytics & Learning Loop</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Measured outcomes from actual recorded client interactions. No invented AI claims or speculative metrics.
        </p>
      </div>

      {/* Conversion Funnel Row */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Actual Outreach Conversion Funnel
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">1. Confirmed Sent</span>
            <p className="text-2xl font-bold text-white mt-1">{summary?.confirmed_sent ?? 0}</p>
            <span className="text-[10px] text-slate-500 font-mono">Operator confirmed</span>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">2. Replies Received</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{summary?.replied ?? 0}</p>
            <span className="text-[10px] text-amber-300 font-mono">
              {summary?.reply_rate_percent ?? 0}% reply rate
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">3. Meetings Booked</span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{summary?.meetings_booked ?? 0}</p>
            <span className="text-[10px] text-indigo-300 font-mono">
              {summary?.meeting_conversion_percent ?? 0}% from reply
            </span>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">4. Proposals Sent</span>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{summary?.proposals_sent ?? 0}</p>
            <span className="text-[10px] text-slate-500 font-mono">Active negotiations</span>
          </div>

          <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase font-mono">5. Closed Deals</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{summary?.deals_won ?? 0}</p>
            <span className="text-[10px] text-emerald-300 font-mono">
              ${(Number(summary?.won_revenue) || 0).toLocaleString()} revenue
            </span>
          </div>
        </div>

        {!summary?.has_sufficient_sample && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Sample size under 10 confirmed sends. Statistical comparison between outreach strategies will become meaningful as more messages are recorded.</span>
          </div>
        )}
      </div>

      {/* Sector Category Comparison */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Category Performance & Reply Rates
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0D12] text-slate-400 uppercase font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Total Prospects</th>
                <th className="py-2.5 px-4">Contacted</th>
                <th className="py-2.5 px-4">Replied</th>
                <th className="py-2.5 px-4">Reply Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.categories.map((c) => (
                <tr key={c.category_id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{c.name}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{c.prospects_count}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{c.contacted_count}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{c.replied_count}</td>
                  <td className="py-3 px-4">
                    {c.reply_rate !== null ? (
                      <span className="font-mono font-bold text-amber-400">{c.reply_rate}%</span>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">No sends</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Token & Spend Efficiency */}
      <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-4">
        <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          AI Compute Efficiency & Spend
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[11px] text-slate-400">Total Tokens</span>
            <p className="text-xl font-bold text-white mt-1">
              {(data?.ai_usage.total_tokens ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[11px] text-slate-400">Total Model Calls</span>
            <p className="text-xl font-bold text-white mt-1">
              {data?.ai_usage.total_calls ?? 0}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5">
            <span className="text-[11px] text-slate-400">Actual Cost (USD)</span>
            <p className="text-xl font-bold text-amber-400 mt-1">
              ${(data?.ai_usage.estimated_spend_usd ?? 0).toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
