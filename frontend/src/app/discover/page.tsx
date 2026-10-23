'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Globe, 
  MapPin, 
  Layers, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Camera,
  Sofa,
  Stethoscope,
  Utensils,
  Calendar,
  Search
} from 'lucide-react';
import { api, Category, CategoryPlaybook } from '@/lib/api';

export default function DiscoverPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<number | ''>('');
  const [locationQuery, setLocationQuery] = useState('');
  const [mode, setMode] = useState<'quick' | 'deep'>('quick');
  const [manualUrl, setManualUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providersStatus, setProvidersStatus] = useState<any>(null);

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      const firstPlaybook = cats.flatMap((c) => c.playbooks || [])[0];
      if (firstPlaybook) {
        setSelectedPlaybookId(firstPlaybook.id);
        setLocationQuery(firstPlaybook.default_geography || 'Pune, India');
      }
    }).catch(console.error);

    api.getProviders().then(setProvidersStatus).catch(console.error);
  }, []);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const allPlaybooks = categories.flatMap((c) => c.playbooks || []);
      const selectedPb = allPlaybooks.find((p) => p.id === Number(selectedPlaybookId));

      await api.createResearchRun({
        category_playbook_id: selectedPb?.id,
        category_name: selectedPb?.name,
        location_query: locationQuery,
        mode,
        manual_url: manualUrl.trim() || undefined,
        business_name: businessName.trim() || undefined,
        instagram_handle: instagramHandle.trim() || undefined,
      });

      router.push('/runs');
    } catch (err: any) {
      setError(err.message || 'Failed to start research run');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'Building2': return Building2;
      case 'Camera': return Camera;
      case 'Sofa': return Sofa;
      case 'Stethoscope': return Stethoscope;
      case 'Utensils': return Utensils;
      case 'Calendar': return Calendar;
      default: return Sparkles;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Prospect Discovery & Evidence Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select target sector criteria or enter a direct website URL to execute SSRF-safe crawling, technical audits, and personalized draft synthesis.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Configuration Form */}
      <form onSubmit={handleLaunch} className="space-y-6">
        {/* 1. Category Selection Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            1. Select Target Category & Playbook
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const defaultPlaybook = cat.playbooks?.[0];
              const isSelected = selectedPlaybookId === defaultPlaybook?.id;

              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    if (defaultPlaybook) {
                      setSelectedPlaybookId(defaultPlaybook.id);
                      if (defaultPlaybook.default_geography) {
                        setLocationQuery(defaultPlaybook.default_geography);
                      }
                    }
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/5'
                      : 'border-white/10 bg-[#121620] hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="font-semibold text-xs text-white">{cat.name}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {cat.description || 'Targeted prospect criteria and evidence rubrics.'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Location & Criteria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-[#121620] border border-white/10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Geography / Location Query
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="e.g. Pune, Mumbai, London"
                className="w-full bg-[#0B0D12] border border-white/10 rounded-md pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Defines location focus for candidate filtering.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Research Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`py-2 px-3 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'quick'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-[#0B0D12] text-slate-400'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('deep')}
                className={`py-2 px-3 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'deep'
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                    : 'border-white/10 bg-[#0B0D12] text-slate-400'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Deep Research</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Direct URL Option */}
        <div className="p-5 rounded-xl bg-[#121620] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Direct Candidate URL Research
            </label>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Works without external search API keys
            </span>
          </div>

          <div>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://architecture-studio.com"
                className="w-full bg-[#0B0D12] border border-white/10 rounded-md pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Provide any business website. NebulaScout will execute an SSRF-safe crawl, inspect viewport and image metadata, identify enquiry paths, and synthesize personalized outreach.
            </p>
          </div>

          {manualUrl && (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Business Name (Optional)</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Studio Monolith"
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Instagram Handle (Optional)</label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@studio.handle"
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-md shadow-lg shadow-amber-500/10 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Executing Research Run...' : 'Execute Research Run'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
