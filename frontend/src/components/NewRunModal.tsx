'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Globe, MapPin, Zap, Layers, AlertCircle } from 'lucide-react';
import { api, CategoryPlaybook } from '@/lib/api';

interface NewRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunCreated?: (runId: number) => void;
}

export function NewRunModal({ isOpen, onClose, onRunCreated }: NewRunModalProps) {
  const [playbooks, setPlaybooks] = useState<CategoryPlaybook[]>([]);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<number | ''>('');
  const [locationQuery, setLocationQuery] = useState('');
  const [mode, setMode] = useState<'quick' | 'deep'>('quick');
  const [manualUrl, setManualUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getCategories().then((cats) => {
        const allPlaybooks = cats.flatMap((c) => c.playbooks || []);
        setPlaybooks(allPlaybooks);
        if (allPlaybooks.length > 0 && !selectedPlaybookId) {
          setSelectedPlaybookId(allPlaybooks[0].id);
          setLocationQuery(allPlaybooks[0].default_geography || 'Pune, India');
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const selectedPlaybook = playbooks.find((p) => p.id === Number(selectedPlaybookId));
      const res = await api.createResearchRun({
        category_playbook_id: selectedPlaybook ? selectedPlaybook.id : null,
        category_name: selectedPlaybook?.name,
        location_query: locationQuery,
        mode,
        manual_url: manualUrl.trim() || undefined,
        business_name: businessName.trim() || undefined,
        instagram_handle: instagramHandle.trim() || undefined,
      });

      if (onRunCreated) {
        onRunCreated(res.id);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to start research run');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121620] border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">New Prospect Research Run</h3>
              <p className="text-xs text-slate-400">Targeted discovery, safe audit & evidence collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Category Playbook
            </label>
            <select
              value={selectedPlaybookId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedPlaybookId(id);
                const pb = playbooks.find((p) => p.id === id);
                if (pb?.default_geography) setLocationQuery(pb.default_geography);
              }}
              className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              {playbooks.map((pb) => (
                <option key={pb.id} value={pb.id}>
                  {pb.name} ({pb.category?.name || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Target Location / Geography
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="e.g. Pune, Mumbai, London"
                className="w-full bg-[#0B0D12] border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Manual Candidate URL (Direct Audit & Research)
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://studio-website.com (optional)"
                className="w-full bg-[#0B0D12] border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {manualUrl && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Studio name"
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Instagram Handle</label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@studio.handle"
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Research Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  mode === 'quick'
                    ? 'border-amber-500/50 bg-amber-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Quick Mode</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Rapid discovery, core website audit & instant draft.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('deep')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  mode === 'deep'
                    ? 'border-amber-500/50 bg-amber-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5 font-medium text-xs mb-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Deep Research</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Deep page crawl, comprehensive opportunities & full score breakdown.
                </p>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs rounded-md shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Launching...' : 'Start Research Run'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
