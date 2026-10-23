'use client';

import { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Globe, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  FileText, 
  RefreshCw, 
  ChevronRight,
  MessageSquare,
  History,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import { InstagramIcon } from './InstagramIcon';
import { api, Prospect, OutreachDraft } from '@/lib/api';
import { ScoreBadge } from './ScoreBadge';
import { ConfirmSentModal } from './ConfirmSentModal';

interface ProspectDetailModalProps {
  prospectId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onProspectUpdated?: () => void;
}

export function ProspectDetailModal({
  prospectId,
  isOpen,
  onClose,
  onProspectUpdated,
}: ProspectDetailModalProps) {
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'evidence' | 'audit' | 'outreach' | 'timeline'>('overview');
  const [copiedDraftId, setCopiedDraftId] = useState<number | null>(null);
  const [selectedDraftForSend, setSelectedDraftForSend] = useState<OutreachDraft | null>(null);
  const [activeChannel, setActiveChannel] = useState('instagram_dm');
  const [editableBody, setEditableBody] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isReResearching, setIsReResearching] = useState(false);

  useEffect(() => {
    if (prospectId && isOpen) {
      loadProspect(prospectId);
    }
  }, [prospectId, isOpen]);

  const loadProspect = async (id: number) => {
    setLoading(true);
    try {
      const data = await api.getProspect(id);
      setProspect(data);
      const initialDraft = data.drafts?.find((d) => d.channel === activeChannel) || data.drafts?.[0];
      if (initialDraft) {
        setEditableBody(initialDraft.body);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !prospectId) return null;

  if (loading || !prospect) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-3xl h-screen bg-[#0E1117] border-l border-white/10 flex items-center justify-center p-8">
          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Loading prospect dossier...</span>
          </div>
        </div>
      </div>
    );
  }

  const currentDraft = prospect?.drafts?.find((d) => d.channel === activeChannel) || prospect?.drafts?.[0];

  const handleCopyDraft = async (draft: OutreachDraft) => {
    try {
      await navigator.clipboard.writeText(editableBody || draft.body);
      await api.copyDraft(draft.id);
      setCopiedDraftId(draft.id);
      setTimeout(() => setCopiedDraftId(null), 2500);
      loadProspect(prospect!.id);
      onProspectUpdated?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateNewDraft = async () => {
    if (!prospect) return;
    setIsGeneratingDraft(true);
    try {
      await api.generateDraft(prospect.id, activeChannel);
      await loadProspect(prospect.id);
      onProspectUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleReResearch = async () => {
    if (!prospect) return;
    setIsReResearching(true);
    try {
      await api.researchProspect(prospect.id);
      await loadProspect(prospect.id);
      onProspectUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsReResearching(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!currentDraft) return;
    try {
      await api.updateDraft(currentDraft.id, { body: editableBody });
      await loadProspect(prospect!.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || !prospect) return;
    try {
      await api.addNote(prospect.id, noteContent.trim());
      setNoteContent('');
      loadProspect(prospect.id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-screen bg-[#0E1117] border-l border-white/10 flex flex-col justify-between shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-[#121620]">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-tight">{prospect?.business_name}</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {prospect?.stage.replace('_', ' ')}
                </span>
                {prospect?.tags?.includes('Demo Data') && (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                    Demo Data
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                {prospect?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {prospect.location}
                  </span>
                )}
                {prospect?.primary_url && (
                  <a
                    href={prospect.primary_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-slate-300 hover:text-amber-400 underline underline-offset-2"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {prospect.normalized_domain || 'Website'}
                  </a>
                )}
                {prospect?.instagram_handle && (
                  <a
                    href={prospect.instagram_url || `https://instagram.com/${prospect.instagram_handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-slate-300 hover:text-pink-400 underline underline-offset-2"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                    @{prospect.instagram_handle}
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReResearch}
                disabled={isReResearching}
                title="Run fresh website audit and AI synthesis"
                className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isReResearching ? 'animate-spin text-amber-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scores Row */}
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
            <ScoreBadge
              label="Fit Score"
              score={prospect?.fit_score || 0}
              explanation={prospect?.score_explanation?.fit_factors}
              size="md"
            />
            <ScoreBadge
              label="Opportunity"
              score={prospect?.opportunity_score || 0}
              explanation={prospect?.score_explanation?.opportunity_factors}
              size="md"
            />
            <ScoreBadge
              label="Confidence"
              score={prospect?.confidence_score || 0}
              explanation={prospect?.score_explanation?.confidence_factors}
              size="md"
            />
            {prospect.last_researched_at && (new Date().getTime() - new Date(prospect.last_researched_at).getTime()) > 60 * 86400000 && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Clock className="w-3 h-3" />
                Stale Research
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 border-b border-white/10 bg-[#0B0D12] text-xs font-medium text-slate-400">
          {(['overview', 'outreach', 'audit', 'evidence', 'timeline'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 border-b-2 capitalize transition-colors ${
                activeTab === tab
                  ? 'border-amber-400 text-white font-semibold'
                  : 'border-transparent hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Assessment */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Strategic Assessment & Recommended Action</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {prospect?.category?.description || 'Boutique prospective client identified for high-performance editorial web services.'}
                </p>
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-200">
                  <strong>Recommended Next Step:</strong> Review personalized draft in Outreach tab, verify Cliff House basalt observation, copy draft, and send manually via Instagram DM.
                </div>
              </div>

              {/* Opportunities */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Identified Opportunities ({prospect?.opportunities?.length || 0})
                </h4>
                <div className="space-y-2.5">
                  {prospect?.opportunities?.map((opp) => (
                    <div key={opp.id} className="p-3.5 rounded-lg bg-[#121620] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs text-white">{opp.title}</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Hypothesis ({(opp.confidence * 100).toFixed(0)}% conf)
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{opp.rationale}</p>
                    </div>
                  ))}
                  {(!prospect?.opportunities || prospect.opportunities.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No opportunities extracted yet. Run research to synthesize.</p>
                  )}
                </div>
              </div>

              {/* Observations Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Observed Facts vs Hypotheses
                </h4>
                <div className="space-y-2">
                  {prospect?.observations?.map((obs) => (
                    <div key={obs.id} className="p-3 rounded-lg bg-[#121620] border border-white/5 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                          obs.kind === 'observed_fact' 
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}>
                          {obs.kind.replace('_', ' ')}
                        </span>
                        <span className="text-slate-200">{obs.claim}</span>
                      </div>
                      {obs.evidence_excerpt && (
                        <p className="text-[11px] text-slate-400 pl-2 border-l border-white/10 italic">
                          &quot;{obs.evidence_excerpt}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OUTREACH WORKSPACE */}
          {activeTab === 'outreach' && (
            <div className="space-y-6">
              {/* Channel Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(['instagram_dm', 'email', 'website_contact'] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setActiveChannel(ch)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        activeChannel === ch
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-semibold'
                          : 'border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ch === 'instagram_dm' ? 'Instagram DM' : ch === 'email' ? 'Email' : 'Website Form'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleGenerateNewDraft}
                  disabled={isGeneratingDraft}
                  className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isGeneratingDraft ? 'Generating...' : 'Regenerate Draft'}</span>
                </button>
              </div>

              {/* Draft Box */}
              <div className="p-4 rounded-xl bg-[#121620] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Draft Status: <strong className="text-amber-400 uppercase font-mono">{currentDraft?.status || 'New'}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Version: {currentDraft?.version || 1}
                  </span>
                </div>

                <textarea
                  rows={7}
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  onBlur={handleSaveDraft}
                  placeholder="Outreach draft content..."
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-lg p-3.5 text-xs text-white font-sans leading-relaxed focus:outline-none focus:border-amber-500"
                />

                {/* Workflow Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    {/* 1. Copy Message */}
                    <button
                      onClick={() => currentDraft && handleCopyDraft(currentDraft)}
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-md border border-white/10 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedDraftId === currentDraft?.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>

                    {/* 2. Open Profile */}
                    {prospect.instagram_url || prospect.instagram_handle ? (
                      <a
                        href={prospect.instagram_url || `https://instagram.com/${prospect.instagram_handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs rounded-md border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                        <span>Open Profile</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ) : prospect.primary_url ? (
                      <a
                        href={prospect.primary_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs rounded-md border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <span>Open Website</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ) : null}
                  </div>

                  {/* 3. Mark as Sent Confirmation */}
                  <button
                    onClick={() => currentDraft && setSelectedDraftForSend(currentDraft)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-md shadow-md flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirm Sent Externally</span>
                  </button>
                </div>
              </div>

              {/* Sent Messages History */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Historical Sent Messages ({prospect.sent_messages?.length || 0})
                </h4>
                <div className="space-y-3">
                  {prospect.sent_messages?.map((sent) => (
                    <div key={sent.id} className="p-3.5 rounded-lg bg-[#121620] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-400 capitalize flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Sent via {sent.channel.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(sent.sent_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono bg-[#0B0D12] p-2.5 rounded border border-white/5 whitespace-pre-wrap">
                        {sent.exact_sent_text}
                      </p>
                    </div>
                  ))}
                  {(!prospect.sent_messages || prospect.sent_messages.length === 0) && (
                    <p className="text-xs text-slate-400 italic">No messages marked as sent yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEBSITE AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {prospect.latest_website_audit ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#121620] border border-white/5 rounded-lg">
                      <span className="text-[11px] text-slate-400">Response Speed</span>
                      <p className="text-sm font-bold text-white mt-1">
                        {prospect.latest_website_audit.response_time_ms} ms
                      </p>
                    </div>
                    <div className="p-3 bg-[#121620] border border-white/5 rounded-lg">
                      <span className="text-[11px] text-slate-400">Image Alt Coverage</span>
                      <p className="text-sm font-bold text-white mt-1">
                        {prospect.latest_website_audit.alt_coverage_percent}%
                      </p>
                    </div>
                    <div className="p-3 bg-[#121620] border border-white/5 rounded-lg">
                      <span className="text-[11px] text-slate-400">HTTPS Encryption</span>
                      <p className="text-sm font-bold text-emerald-400 mt-1">
                        {prospect.latest_website_audit.https_supported ? 'Enabled' : 'No'}
                      </p>
                    </div>
                    <div className="p-3 bg-[#121620] border border-white/5 rounded-lg">
                      <span className="text-[11px] text-slate-400">Mobile Viewport Meta</span>
                      <p className="text-sm font-bold text-emerald-400 mt-1">
                        {prospect.latest_website_audit.viewport_meta_found ? 'Present' : 'Missing'}
                      </p>
                    </div>
                  </div>

                  {/* Enquiry Paths Discovered */}
                  <div className="p-4 bg-[#121620] border border-white/5 rounded-lg space-y-2">
                    <span className="text-xs font-semibold text-slate-300">Enquiry Paths Discovered</span>
                    <ul className="space-y-1">
                      {prospect.latest_website_audit.enquiry_paths_found?.map((path, idx) => (
                        <li key={idx} className="text-xs font-mono text-amber-300 bg-white/5 px-2 py-1 rounded">
                          {path}
                        </li>
                      ))}
                      {(!prospect.latest_website_audit.enquiry_paths_found || prospect.latest_website_audit.enquiry_paths_found.length === 0) && (
                        <li className="text-xs text-rose-400 italic">No enquiry paths or contact forms discovered during crawl.</li>
                      )}
                    </ul>
                  </div>

                  {/* Tech stack signals */}
                  <div className="p-4 bg-[#121620] border border-white/5 rounded-lg space-y-2">
                    <span className="text-xs font-semibold text-slate-300">Detected Technologies</span>
                    <div className="flex flex-wrap gap-2">
                      {prospect.latest_website_audit.tech_stack_signals?.map((t, idx) => (
                        <span key={idx} className="px-2 py-1 rounded text-xs bg-white/5 text-slate-300 border border-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <Globe className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400">No website audit completed for this prospect yet.</p>
                  <button
                    onClick={handleReResearch}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-medium rounded-md transition-colors"
                  >
                    Run Website Audit
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EVIDENCE STORE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Source Evidence & Provenance ({prospect.sources?.length || 0})
              </h4>
              <div className="space-y-3">
                {prospect.sources?.map((src) => (
                  <div key={src.id} className="p-3.5 rounded-lg bg-[#121620] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-sm">{src.page_title || src.source_url}</span>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(src.retrieved_at).toLocaleDateString()}</span>
                    </div>
                    {src.excerpt && (
                      <p className="text-xs text-slate-400 leading-relaxed italic bg-[#0B0D12] p-2 rounded">
                        &quot;{src.excerpt}&quot;
                      </p>
                    )}
                    <a
                      href={src.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline"
                    >
                      <span>View Original Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE & NOTES */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Add Note */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">Internal Operator Note</label>
                <textarea
                  rows={2}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record call outcome, feedback, or strategic detail..."
                  className="w-full bg-[#121620] border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={!noteContent.trim()}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-md disabled:opacity-40 transition-colors"
                >
                  Save Note
                </button>
              </form>

              {/* Activity Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Activity Feed</h4>
                <div className="space-y-2.5">
                  {prospect.activities?.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 text-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <div className="flex-1 bg-[#121620] p-2.5 rounded border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white capitalize">{act.event_type.replace('_', ' ')}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(act.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 mt-1">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Send Confirmation Modal */}
      {selectedDraftForSend && (
        <ConfirmSentModal
          draft={selectedDraftForSend}
          businessName={prospect.business_name}
          isOpen={true}
          onClose={() => setSelectedDraftForSend(null)}
          onConfirmed={async (data) => {
            await api.confirmSent(selectedDraftForSend.id, data);
            await loadProspect(prospect.id);
            onProspectUpdated?.();
          }}
        />
      )}
    </div>
  );
}
