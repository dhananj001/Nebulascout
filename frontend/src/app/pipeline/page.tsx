'use client';

import { useState, useEffect } from 'react';
import { 
  Kanban, 
  Plus, 
  ChevronRight, 
  ArrowRight, 
  Globe, 
  Sparkles,
  CheckCircle2,
  Send
} from 'lucide-react';
import { api, Prospect } from '@/lib/api';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ProspectDetailModal } from '@/components/ProspectDetailModal';

const PIPELINE_COLUMNS = [
  { id: 'discovered', label: 'Discovered', color: 'border-slate-700' },
  { id: 'needs_review', label: 'Needs Review', color: 'border-amber-500/30' },
  { id: 'qualified', label: 'Qualified', color: 'border-emerald-500/30' },
  { id: 'draft_ready', label: 'Draft Ready', color: 'border-blue-500/30' },
  { id: 'contacted', label: 'Contacted', color: 'border-purple-500/30' },
  { id: 'replied', label: 'Replied', color: 'border-amber-400' },
  { id: 'meeting_booked', label: 'Meeting Booked', color: 'border-indigo-400' },
  { id: 'proposal_sent', label: 'Proposal Sent', color: 'border-cyan-400' },
  { id: 'won', label: 'Won Deal', color: 'border-emerald-400' },
];

export default function PipelinePage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    setLoading(true);
    try {
      const res = await api.getProspects({ per_page: 100 });
      setProspects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async (e: React.MouseEvent, prospectId: number, currentStage: string) => {
    e.stopPropagation();
    const currentIndex = PIPELINE_COLUMNS.findIndex((c) => c.id === currentStage);
    if (currentIndex >= 0 && currentIndex < PIPELINE_COLUMNS.length - 1) {
      const nextStage = PIPELINE_COLUMNS[currentIndex + 1].id;
      try {
        await api.updateStage(prospectId, nextStage, 'Advanced from pipeline board');
        loadPipeline();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Kanban className="w-5 h-5 text-amber-400" />
            <span>Outreach & Deal Pipeline</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual stage progression from initial discovery to confirmed outreach and closed engagements.
          </p>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
        {PIPELINE_COLUMNS.map((column) => {
          const colProspects = prospects.filter((p) => p.stage === column.id);

          return (
            <div
              key={column.id}
              className="w-80 shrink-0 bg-[#121620] border border-white/10 rounded-xl flex flex-col h-[calc(100vh-210px)] overflow-hidden shadow-lg"
            >
              {/* Column Header */}
              <div className={`p-3.5 border-b border-white/10 bg-[#0B0D12] flex items-center justify-between border-t-2 ${column.color}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-wide">{column.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {colProspects.length}
                  </span>
                </div>
              </div>

              {/* Cards Container */}
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {colProspects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProspectId(p.id)}
                    className="p-3.5 rounded-lg bg-[#0E1117] border border-white/5 hover:border-amber-500/40 cursor-pointer transition-all space-y-2.5 group shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {p.business_name}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span>{p.category?.name || 'Unassigned'}</span>
                      {p.location && <span>· {p.location.split(',')[0]}</span>}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <ScoreBadge label="Fit" score={p.fit_score} />
                      <ScoreBadge label="Opp" score={p.opportunity_score} />
                    </div>

                    {/* Quick Move Button */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-mono">
                        {p.drafts?.length ? `${p.drafts.length} drafts` : 'No draft'}
                      </span>
                      <button
                        onClick={(e) => handleAdvanceStage(e, p.id, p.stage)}
                        title="Move to next pipeline stage"
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-0.5 text-[11px] font-medium"
                      >
                        <span>Advance</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {colProspects.length === 0 && (
                  <div className="h-28 flex items-center justify-center text-[11px] text-slate-400 italic">
                    No prospects in stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prospect Inspection Drawer */}
      <ProspectDetailModal
        prospectId={selectedProspectId}
        isOpen={Boolean(selectedProspectId)}
        onClose={() => setSelectedProspectId(null)}
        onProspectUpdated={loadPipeline}
      />
    </div>
  );
}
