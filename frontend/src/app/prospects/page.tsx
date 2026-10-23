'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Download, 
  Upload, 
  Globe, 
  ExternalLink,
  Clock, 
  FileSpreadsheet,
  Sparkles,
  ChevronRight
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
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
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
  }, [search, selectedCategoryId, selectedStage, sortBy, sortDirection, staleOnly, page]);

  const loadProspects = async () => {
    setLoading(true);
    try {
      const res = await api.getProspects({
        search,
        category_id: selectedCategoryId || undefined,
        stage: selectedStage || undefined,
        sort: sortBy,
        direction: sortDirection,
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
    <div className="py-10 px-8 max-w-7xl mx-auto space-y-7">
      {/* Editorial Apple Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Prospects Directory
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
              {total} Total
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
            Verified candidate businesses with social channels, bio links, website audits, and outreach dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-3.5 py-1.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-neutral-700 dark:text-neutral-300 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <a
            href={api.getExportUrl(selectedStage, selectedCategoryId)}
            download
            className="px-3.5 py-1.5 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-neutral-700 dark:text-neutral-300 font-medium text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar - Clean Apple Card */}
      <div className="p-3 rounded-2xl bg-white dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search studio, @handle, website or city..."
              className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl pl-9 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
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
            className="bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
          >
            <option value="">All Pipeline Stages</option>
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

          {/* Timestamp & Score Sort Selector */}
          <select
            value={`${sortBy}:${sortDirection}`}
            onChange={(e) => {
              const [field, dir] = e.target.value.split(':');
              setSortBy(field);
              setSortDirection(dir as 'desc' | 'asc');
            }}
            className="bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
          >
            <option value="created_at:desc">Newest Discovered First</option>
            <option value="created_at:asc">Oldest Discovered First</option>
            <option value="fit_score:desc">Highest Fit Score</option>
            <option value="opportunity_score:desc">Highest Opportunity Score</option>
            <option value="business_name:asc">Alphabetical (A-Z)</option>
          </select>

          {/* Stale Filter Toggle */}
          <button
            type="button"
            onClick={() => setStaleOnly(!staleOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              staleOnly
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold'
                : 'border-black/[0.06] dark:border-white/[0.06] bg-neutral-50/50 dark:bg-white/[0.02] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Stale Research ({'>'}60d)</span>
          </button>
        </div>

        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium px-2">
          Showing {prospects.length} of {total}
        </div>
      </div>

      {/* Prospects Directory Table */}
      <div className="rounded-2xl bg-white dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/70 dark:bg-white/[0.02] text-neutral-400 dark:text-neutral-500 font-medium text-[11px] border-b border-black/[0.06] dark:border-white/[0.06]">
              <tr>
                <th className="py-3 px-5 font-medium">Studio / Business</th>
                <th className="py-3 px-4 font-medium">Discovered</th>
                <th className="py-3 px-4 font-medium">Direct Channels</th>
                <th className="py-3 px-4 font-medium">Scores (Fit · Opp · Conf)</th>
                <th className="py-3 px-4 font-medium">Stage</th>
                <th className="py-3 px-4 font-medium">Audit Status</th>
                <th className="py-3 px-5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
              {prospects.map((p) => {
                const instagramUrl = p.instagram_url || (p.instagram_handle ? `https://instagram.com/${p.instagram_handle.replace(/^@/, '')}` : null);
                const createdDate = p.created_at ? new Date(p.created_at) : null;
                const formattedTime = createdDate ? createdDate.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
                
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProspectId(p.id)}
                    className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer transition-colors group"
                  >
                    {/* Business & Category */}
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-[#0071E3] dark:group-hover:text-[#2997FF] transition-colors flex items-center gap-2">
                        <span>{p.business_name}</span>
                        {p.tags?.includes('Demo Data') && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-neutral-200/70 dark:bg-white/10 text-neutral-600 dark:text-neutral-400">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 mt-0.5">
                        <span>{p.category?.name || 'Studio'}</span>
                        {p.location && <span>· {p.location}</span>}
                      </div>
                    </td>

                    {/* Discovered Timestamp */}
                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="whitespace-nowrap">{formattedTime}</span>
                      </div>
                    </td>

                    {/* Channels with Direct Clickable Links */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 text-xs">
                        {/* Direct Instagram Link */}
                        {instagramUrl && (
                          <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20 transition-all font-medium text-[11px] group/insta"
                            title={`Open Instagram profile (@${p.instagram_handle}) directly in a new tab`}
                          >
                            <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                            <span>@{p.instagram_handle?.replace(/^@/, '')}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover/insta:opacity-100 transition-opacity" />
                          </a>
                        )}

                        {/* Direct Website Link */}
                        {p.primary_url && (
                          <a
                            href={p.primary_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors text-[11px] group/web"
                            title={`Visit website (${p.normalized_domain || p.primary_url})`}
                          >
                            <Globe className="w-3 h-3 text-neutral-400" />
                            <span>{p.normalized_domain || 'Site'}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-40 group-hover/web:opacity-100 transition-opacity" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Scores */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <ScoreBadge label="Fit" score={p.fit_score} explanation={p.score_explanation?.fit_factors} />
                        <ScoreBadge label="Opp" score={p.opportunity_score} explanation={p.score_explanation?.opportunity_factors} />
                        <ScoreBadge label="Conf" score={p.confidence_score} explanation={p.score_explanation?.confidence_factors} />
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-200/70 dark:bg-white/10 text-neutral-700 dark:text-neutral-300">
                        {p.stage.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Audit Status */}
                    <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400">
                      {p.latest_website_audit ? (
                        <span className={`text-[11px] font-medium ${
                          p.latest_website_audit.status === 'pass' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {p.latest_website_audit.response_time_ms}ms · {p.latest_website_audit.alt_coverage_percent}% alt
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Not Audited</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                          className="px-2.5 py-1 text-[11px] font-medium text-neutral-800 dark:text-neutral-200 hover:text-white bg-black/[0.04] hover:bg-neutral-900 dark:bg-white/[0.06] dark:hover:bg-white dark:hover:text-neutral-900 rounded-lg transition-all flex items-center gap-1 shadow-xs disabled:opacity-50"
                          title="Generate personalized pitch on-demand"
                        >
                          <Sparkles className={`w-3 h-3 text-[#0071E3] dark:text-[#2997FF] ${generatingId === p.id ? 'animate-spin' : ''}`} />
                          <span>{generatingId === p.id ? 'Drafting...' : 'AI Pitch'}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProspectId(p.id);
                          }}
                          className="px-2.5 py-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] rounded-lg transition-colors flex items-center gap-0.5"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3 text-neutral-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {prospects.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-xs text-neutral-400 dark:text-neutral-500">
                    No studio prospects found matching your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#18181B] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-semibold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
                <span>Import Prospects via CSV</span>
              </div>
              <button onClick={() => setIsImportOpen(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-medium mb-1">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  ref={fileInputRef}
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:bg-neutral-900 dark:file:bg-white file:text-white dark:file:text-neutral-900 font-medium cursor-pointer"
                />
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                  Supports headers: business_name / name, website / url, instagram / handle, location, phone, email.
                </p>
              </div>

              {importResult && (
                <div className={`p-3 rounded-xl text-xs ${importResult.error ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
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
                  className="px-3.5 py-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !importFile}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium rounded-xl shadow-xs disabled:opacity-50"
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
