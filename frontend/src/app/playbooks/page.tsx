'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Download, 
  Upload, 
  Plus, 
  Save, 
  Sliders, 
  ShieldCheck, 
  FileJson,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api, Category, CategoryPlaybook } from '@/lib/api';

export default function PlaybooksPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPlaybook, setSelectedPlaybook] = useState<CategoryPlaybook | null>(null);
  const [editingPlaybook, setEditingPlaybook] = useState<Partial<CategoryPlaybook>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlaybooks();
  }, []);

  const loadPlaybooks = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
      const allPb = cats.flatMap((c) => c.playbooks || []);
      if (allPb.length > 0 && !selectedPlaybook) {
        setSelectedPlaybook(allPb[0]);
        setEditingPlaybook(allPb[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPlaybook = (pb: CategoryPlaybook) => {
    setSelectedPlaybook(pb);
    setEditingPlaybook(pb);
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaybook) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await api.updatePlaybook(selectedPlaybook.id, editingPlaybook);
      setSelectedPlaybook(updated);
      setEditingPlaybook(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadPlaybooks();
    } catch (err: any) {
      setError(err.message || 'Failed to update playbook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    if (!selectedPlaybook) return;
    const blob = new Blob([JSON.stringify(selectedPlaybook, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playbook_${selectedPlaybook.slug}.json`;
    a.click();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Category Playbooks & Scoring Rubrics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Data-driven customer profile definitions, opportunity hypotheses, scoring weights, and outreach tone boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            disabled={!selectedPlaybook}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs rounded-md border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playbooks Menu */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Configured Playbooks
          </span>

          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 uppercase px-2">{cat.name}</span>
                {cat.playbooks?.map((pb) => (
                  <div
                    key={pb.id}
                    onClick={() => handleSelectPlaybook(pb)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      selectedPlaybook?.id === pb.id
                        ? 'border-amber-500 bg-amber-500/10 text-white font-semibold'
                        : 'border-white/5 bg-[#121620] hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{pb.name}</span>
                      {pb.is_default && (
                        <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-white/10 text-slate-400">Default</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Playbook Editor */}
        <div className="lg:col-span-2">
          {selectedPlaybook ? (
            <form onSubmit={handleSave} className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-base font-bold text-white">{selectedPlaybook.name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Slug: {selectedPlaybook.slug}</p>
                </div>
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    Changes Saved
                  </span>
                )}
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg">
                  {error}
                </div>
              )}

              {/* Ideal Customer Profile */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ideal Customer Profile (ICP Definition)
                </label>
                <textarea
                  rows={3}
                  value={editingPlaybook.ideal_customer_profile || ''}
                  onChange={(e) => setEditingPlaybook({ ...editingPlaybook, ideal_customer_profile: e.target.value })}
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md p-3 text-xs text-white leading-relaxed focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Tone & Outreach Boundaries */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Outreach Tone
                  </label>
                  <input
                    type="text"
                    value={editingPlaybook.outreach_tone || ''}
                    onChange={(e) => setEditingPlaybook({ ...editingPlaybook, outreach_tone: e.target.value })}
                    className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Re-research Interval (Days)
                  </label>
                  <input
                    type="number"
                    value={editingPlaybook.re_research_days || 60}
                    onChange={(e) => setEditingPlaybook({ ...editingPlaybook, re_research_days: Number(e.target.value) })}
                    className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Scoring Weights */}
              <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5 space-y-3">
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                  Scoring Rubric Weights (Deterministic Qualification)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  {[
                    { key: 'service_fit', label: 'Service Fit' },
                    { key: 'evidence_opportunity', label: 'Opportunity' },
                    { key: 'business_potential', label: 'Potential' },
                    { key: 'research_confidence', label: 'Confidence' },
                    { key: 'reachability', label: 'Reachability' },
                  ].map(({ key, label }) => (
                    <div key={key} className="p-2 bg-white/5 rounded border border-white/5">
                      <span className="text-[10px] text-slate-400 block mb-1">{label}</span>
                      <span className="text-sm font-mono font-bold text-white">
                        {editingPlaybook.scoring_weights?.[key] ?? 20}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferred Services & Value Proposition */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Preferred Services Offered
                </label>
                <div className="flex flex-wrap gap-2">
                  {editingPlaybook.preferred_services?.map((svc, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prohibited Claims */}
              <div>
                <label className="block text-xs font-semibold text-rose-400 mb-1.5">
                  Prohibited Outreach Claims (Enforced on AI Drafts)
                </label>
                <ul className="space-y-1 list-disc list-inside text-xs text-slate-400">
                  {editingPlaybook.prohibited_claims?.map((claim, idx) => (
                    <li key={idx}>{claim}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-md transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Playbook Criteria'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 italic">
              Select a playbook to edit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
