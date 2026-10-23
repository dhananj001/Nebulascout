'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Plus, 
  Globe, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';
import { api, Prospect, Category } from '@/lib/api';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ProspectDetailModal } from '@/components/ProspectDetailModal';

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [staleOnly, setStaleOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProspectId, setSelectedProspectId] = useState<number | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  
  // CSV Import state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    loadProspects();
  }, [search, selectedCategoryId, selectedStage, staleOnly, page]);

  const loadProspects = async () => {
    setLoading(true);
    try {
      const res = await api.getProspects({
        search,
        category_id: selectedCategoryId || undefined,
        stage: selectedStage || undefined,
        stale_only: staleOnly ? true : undefined,
        page,
        per_page: 25,
      });
      setProspects(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);
    if (selectedCategoryId) {
      formData.append('category_id', selectedCategoryId);
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/prospects/import', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Import failed');
      setImportResult(data);
      loadProspects();
    } catch (err: any) {
      setImportResult({ error: err.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Prospects Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified candidate businesses with source provenance, audit metrics, and outreach records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs rounded-md border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <a
            href={api.getExportUrl(selectedStage, selectedCategoryId)}
            download
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs rounded-md border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Token Optimization Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 shrink-0" />
          <span className="text-emerald-300 font-medium">
            <strong>Token Saver Active:</strong> Discovery runs harvest leads with 0 AI tokens. Click <strong>&quot;AI Pitch&quot;</strong> on targets you actually want to approach.
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400/80">Saves ~85% of Gemini API usage</span>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#121620] border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, domain, or city..."
              className="w-full bg-[#0B0D12] border border-white/10 rounded-md pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="bg-[#0B0D12] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-[#0B0D12] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">All Stages</option>
            <option value="active_pipeline">Active Pipeline Only</option>
            <option value="discovered">Discovered</option>
            <option value="needs_review">Needs Review</option>
            <option value="qualified">Qualified</option>
            <option value="draft_ready">Draft Ready</option>
            <option value="contacted">Contacted</option>
            <option value="replied">Replied</option>
            <option value="meeting_booked">Meeting Booked</option>
            <option value="won">Won</option>
            <option value="do_not_contact">Do Not Contact</option>
          </select>

          {/* Stale Filter Toggle */}
          <button
            type="button"
            onClick={() => setStaleOnly(!staleOnly)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              staleOnly
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Stale Research ({'>'}60d)</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {prospects.length} of {total} prospects
        </div>
      </div>

      {/* Prospects Table */}
      <div className="rounded-xl bg-[#121620] border border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0D12] text-slate-400 uppercase font-mono text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Business & Category</th>
                <th className="py-3 px-4">Channels</th>
                <th className="py-3 px-4">Scores (Fit / Opp / Conf)</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {prospects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProspectId(p.id)}
                  className="hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                      <span>{p.business_name}</span>
                      {p.tags?.includes('Demo Data') && (
                        <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 border border-slate-700">Demo</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{p.category?.name || 'Unassigned'}</span>
                      {p.location && <span>· {p.location}</span>}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <div className="flex items-center gap-2 text-xs">
                      {p.normalized_domain && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Globe className="w-3 h-3 text-slate-500" />
                          {p.normalized_domain}
                        </span>
                      )}
                      {p.instagram_handle && (
                        <span className="flex items-center gap-1 text-pink-400">
                          <InstagramIcon className="w-3 h-3" />
                          @{p.instagram_handle}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <ScoreBadge label="Fit" score={p.fit_score} explanation={p.score_explanation?.fit_factors} />
                      <ScoreBadge label="Opp" score={p.opportunity_score} explanation={p.score_explanation?.opportunity_factors} />
                      <ScoreBadge label="Conf" score={p.confidence_score} explanation={p.score_explanation?.confidence_factors} />
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {p.stage.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">
                    {p.latest_website_audit ? (
                      <span className={`text-[11px] font-mono ${
                        p.latest_website_audit.status === 'pass' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {p.latest_website_audit.response_time_ms}ms · {p.latest_website_audit.alt_coverage_percent}% alt
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono">Not Audited</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          setGeneratingId(p.id);
                          try {
                            await api.generateDraft(p.id, p.instagram_handle ? 'instagram_dm' : 'email');
                            await loadProspects();
                            setSelectedProspectId(p.id);
                          } catch (err: any) {
                            alert(err.message || 'Failed to generate draft');
                          } finally {
                            setGeneratingId(null);
                          }
                        }}
                        disabled={generatingId === p.id}
                        className="px-2.5 py-1 text-[11px] font-semibold text-pink-300 hover:text-white bg-pink-500/10 hover:bg-pink-500/20 rounded border border-pink-500/20 transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                        title="Generate personalized pitch on-demand (preserves tokens)"
                      >
                        <Sparkles className={`w-3 h-3 text-pink-400 ${generatingId === p.id ? 'animate-spin' : ''}`} />
                        <span>{generatingId === p.id ? 'Thinking...' : 'AI Pitch'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProspectId(p.id);
                        }}
                        className="px-2.5 py-1 text-xs text-slate-400 group-hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-colors"
                      >
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {prospects.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    No prospects match the current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#121620] border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Import Prospects via CSV</span>
              </div>
              <button onClick={() => setIsImportOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  ref={fileInputRef}
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-amber-500 file:text-slate-950 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports headers: business_name / name, website / url, instagram / handle, location, phone, email.
                </p>
              </div>

              {importResult && (
                <div className={`p-3 rounded-lg text-xs ${importResult.error ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                  {importResult.error ? (
                    <span>Error: {importResult.error}</span>
                  ) : (
                    <span>Imported {importResult.imported} prospects ({importResult.skipped_duplicates} duplicates skipped).</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded disabled:opacity-50"
                >
                  {importing ? 'Importing...' : 'Upload & Deduplicate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prospect Inspection Drawer */}
      <ProspectDetailModal
        prospectId={selectedProspectId}
        isOpen={Boolean(selectedProspectId)}
        onClose={() => setSelectedProspectId(null)}
        onProspectUpdated={loadProspects}
      />
    </div>
  );
}
