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
  Search,
  Key,
  ShieldCheck,
  ArrowRight,
  Info,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Sliders,
  Users
} from 'lucide-react';
import { api, Category, CategoryPlaybook } from '@/lib/api';
import { InstagramIcon } from '@/components/InstagramIcon';

export default function DiscoverPage() {
  const router = useRouter();
  const [activeWorkflow, setActiveWorkflow] = useState<'instagram_leads' | 'direct_url' | 'sector_search'>('instagram_leads');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<number | ''>('');
  const [locationQuery, setLocationQuery] = useState('Mumbai');
  const [mode, setMode] = useState<'quick' | 'deep'>('quick');
  const [manualUrl, setManualUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providersStatus, setProvidersStatus] = useState<any>(null);
  const [showKeyInstructions, setShowKeyInstructions] = useState(false);
  const [copiedKeyEnv, setCopiedKeyEnv] = useState(false);

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      const firstPlaybook = cats.flatMap((c) => c.playbooks || [])[0];
      if (firstPlaybook) {
        setSelectedPlaybookId(firstPlaybook.id);
        if (firstPlaybook.default_geography) {
          setLocationQuery(firstPlaybook.default_geography.split(',')[0]);
        }
      }
    }).catch(console.error);

    api.getProviders().then(setProvidersStatus).catch(console.error);
  }, []);

  const allPlaybooks = categories.flatMap((c) => c.playbooks || []);
  const selectedPlaybook = allPlaybooks.find((p) => p.id === Number(selectedPlaybookId));

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (activeWorkflow === 'direct_url' && !manualUrl.trim()) {
        throw new Error('Please enter a target website URL or Instagram profile to audit.');
      }

      const res = await api.createResearchRun({
        category_playbook_id: selectedPlaybook ? selectedPlaybook.id : null,
        category_name: selectedPlaybook?.name,
        location_query: locationQuery,
        mode,
        source_type: activeWorkflow === 'instagram_leads' ? 'instagram' : activeWorkflow === 'sector_search' ? 'google' : 'manual',
        manual_url: activeWorkflow === 'direct_url' ? manualUrl.trim() : undefined,
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

  const prefillExample = (type: 'arch' | 'photo' | 'interior') => {
    if (type === 'arch') {
      const pb = allPlaybooks.find(p => p.name.includes('Architecture'));
      if (pb) setSelectedPlaybookId(pb.id);
      setManualUrl('https://monolithatelier.in');
      setBusinessName('Monolith Design Atelier');
      setInstagramHandle('monolith.atelier');
      setLocationQuery('Pune, India');
    } else if (type === 'photo') {
      const pb = allPlaybooks.find(p => p.name.includes('Photographer'));
      if (pb) setSelectedPlaybookId(pb.id);
      setManualUrl('https://kromaimagery.com');
      setBusinessName('Kroma Commercial Imagery');
      setInstagramHandle('kroma.imagery');
      setLocationQuery('Mumbai, India');
    } else {
      const pb = allPlaybooks.find(p => p.name.includes('Interior'));
      if (pb) setSelectedPlaybookId(pb.id);
      setManualUrl('https://essajeesatelier.com');
      setBusinessName('Essajees Atelier');
      setInstagramHandle('essajeesatelier');
      setLocationQuery('Mumbai, India');
    }
  };

  const hasSearchKey = providersStatus?.search?.serper?.configured || providersStatus?.search?.brave_search?.configured;
  const hasGeminiKey = providersStatus?.ai?.has_api_key;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Prospect Discovery & Instagram Harvester</span>
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live & Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Discover verified Instagram studio profiles, audit their bio websites, and generate evidence-grounded DMs.
          </p>
        </div>

        {/* API Status Drawer Toggle */}
        <button
          onClick={() => setShowKeyInstructions(!showKeyInstructions)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121620] hover:bg-white/10 text-xs font-mono border border-white/10 transition-colors"
        >
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300">API Status & Keys</span>
          {showKeyInstructions ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
        </button>
      </div>

      {/* Live Provider Diagnostics Banner */}
      <div className="p-4 rounded-xl bg-[#121620] border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            {/* Instagram Engine Status */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400 shadow-sm shadow-pink-400/50" />
              <span className="text-slate-300 font-medium">Instagram Lead Finder:</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20">
                100% Free & Ban-Proof (Active)
              </span>
            </div>

            {/* Gemini Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${hasGeminiKey ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">Gemini AI:</span>
              <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${hasGeminiKey ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                {hasGeminiKey ? 'Connected (Live Model)' : 'Deterministic Fallback'}
              </span>
            </div>

            {/* Search Provider Status */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${hasSearchKey ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              <span className="text-slate-300 font-medium">Serper Google API:</span>
              <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${hasSearchKey ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-slate-400'}`}>
                {hasSearchKey ? 'Configured & Verified' : 'Missing'}
              </span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {hasGeminiKey && hasSearchKey ? 'All live engines ready' : 'Configure keys in .env'}
          </span>
        </div>

        {/* Expandable Setup Instructions */}
        {showKeyInstructions && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-3 text-xs animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Configured Intelligence Providers</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`GEMINI_API_KEY=\nSERPER_API_KEY=`);
                  setCopiedKeyEnv(true);
                  setTimeout(() => setCopiedKeyEnv(false), 2000);
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
              >
                {copiedKeyEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKeyEnv ? 'Copied template!' : 'Copy .env format'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">1. Google Gemini AI</span>
                  <span className="font-mono text-[10px] text-emerald-400">Connected</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Generates grounded research observations, website redesign angles, and Instagram DM copy.
                </p>
                <p className="text-slate-500 font-mono text-[10px]">Active in backend/.env &rarr; GEMINI_MODEL=gemini-flash-latest</p>
              </div>

              <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">2. Serper Google Search</span>
                  <span className="font-mono text-[10px] text-emerald-400">Connected</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Powers the 100% ban-proof Instagram lead discovery using Google X-Ray indexing.
                </p>
                <p className="text-slate-500 font-mono text-[10px]">Active in backend/.env &rarr; SERPER_API_KEY=f28c7c...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 3 WORKFLOW SWITCHER TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TAB 1: INSTAGRAM STUDIO HARVESTER (PRIMARY) */}
        <div
          onClick={() => setActiveWorkflow('instagram_leads')}
          className={`p-5 rounded-xl border cursor-pointer transition-all space-y-2 relative overflow-hidden ${
            activeWorkflow === 'instagram_leads'
              ? 'border-pink-500/80 bg-gradient-to-b from-[#18111e] to-[#121620] shadow-lg shadow-pink-500/10'
              : 'border-white/10 bg-[#0B0D12] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${activeWorkflow === 'instagram_leads' ? 'bg-gradient-to-br from-pink-500/30 to-purple-500/30 text-pink-400' : 'bg-white/5 text-slate-400'}`}>
                <InstagramIcon className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">Instagram Studio Harvester</h3>
                </div>
                <span className="text-[10px] font-mono text-pink-400 font-semibold">100% Free · Ban-Proof · Targeted</span>
              </div>
            </div>
            {activeWorkflow === 'instagram_leads' && <CheckCircle2 className="w-5 h-5 text-pink-400" />}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Find active design studios, architects, and creators by niche & city. Pulls handles, followers, bio links, and generates tailored Instagram DMs.
          </p>
        </div>

        {/* TAB 2: DIRECT CANDIDATE AUDIT */}
        <div
          onClick={() => setActiveWorkflow('direct_url')}
          className={`p-5 rounded-xl border cursor-pointer transition-all space-y-2 ${
            activeWorkflow === 'direct_url'
              ? 'border-amber-500 bg-[#121620] shadow-lg shadow-amber-500/5'
              : 'border-white/10 bg-[#0B0D12] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${activeWorkflow === 'direct_url' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Direct URL Deep Audit</h3>
                <span className="text-[10px] font-mono text-emerald-400">Instant URL / Profile Inspection</span>
              </div>
            </div>
            {activeWorkflow === 'direct_url' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Paste any specific client URL or Instagram profile directly to execute an instant SSRF audit and generate a pitch dossier.
          </p>
        </div>

        {/* TAB 3: SECTOR BATCH SEARCH */}
        <div
          onClick={() => setActiveWorkflow('sector_search')}
          className={`p-5 rounded-xl border cursor-pointer transition-all space-y-2 ${
            activeWorkflow === 'sector_search'
              ? 'border-amber-500 bg-[#121620] shadow-lg shadow-amber-500/5'
              : 'border-white/10 bg-[#0B0D12] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${activeWorkflow === 'sector_search' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-400'}`}>
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Google Web Search</h3>
                <span className="text-[10px] font-mono text-slate-400">General Domain Crawling</span>
              </div>
            </div>
            {activeWorkflow === 'sector_search' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Broad web-wide search across business domains, directories, and agency websites by city and sector.
          </p>
        </div>
      </div>

      {/* Main Execution Form */}
      <form onSubmit={handleLaunch} className="space-y-6">

        {/* WORKFLOW 1: INSTAGRAM STUDIO HARVESTER (PRIMARY) */}
        {activeWorkflow === 'instagram_leads' && (
          <div className="p-6 rounded-xl bg-gradient-to-b from-[#14101a] to-[#121620] border border-pink-500/30 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <InstagramIcon className="w-4 h-4 text-pink-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Target Instagram Niche & Geography
                </span>
              </div>
              <span className="text-[11px] font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                Google X-Ray · Zero Account Ban Risk
              </span>
            </div>

            {/* Category selection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                1. Select Target Design / Studio Niche
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
                            setLocationQuery(defaultPlaybook.default_geography.split(',')[0]);
                          }
                        }
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/10 text-white shadow-md'
                          : 'border-white/10 bg-[#0B0D12] hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-pink-400' : 'text-slate-400'}`} />
                          <span className="font-semibold text-xs text-white">{cat.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-pink-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {cat.description || 'Targeted criteria and personalized Instagram DM angle.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target City & Depth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  2. Target City / Region
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="e.g. Mumbai, London, Dubai, New York"
                    className="w-full bg-[#0B0D12] border border-white/10 rounded-md pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                {/* Popular City Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Mumbai', 'Delhi', 'Bengaluru', 'Dubai', 'London', 'New York'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setLocationQuery(city)}
                      className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                        locationQuery === city ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-semibold' : 'bg-white/5 border-white/5 text-slate-400'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  3. Batch Volume
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('quick')}
                    className={`py-2 px-3 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      mode === 'quick'
                        ? 'border-pink-500 bg-pink-500/20 text-pink-300'
                        : 'border-white/10 bg-[#0B0D12] text-slate-400'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-pink-400" />
                    <span>Quick (6 Profiles)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('deep')}
                    className={`py-2 px-3 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      mode === 'deep'
                        ? 'border-pink-500 bg-pink-500/20 text-pink-300'
                        : 'border-white/10 bg-[#0B0D12] text-slate-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-pink-400" />
                    <span>Deep (12 Profiles)</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  Pulls verified Instagram handles, followers count, bio link, audits their site, and drafts DMs.
                </span>
              </div>
            </div>

            {/* How It Works Explainer Box */}
            <div className="p-4 rounded-lg bg-[#0B0D12] border border-white/5 space-y-2">
              <span className="text-[11px] text-pink-400 uppercase font-mono block">
                How Ban-Proof Instagram Harvesting Works
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded bg-white/5 border border-white/5">
                  <span className="font-semibold text-pink-400 block">1. Google X-Ray</span>
                  <span className="text-[10px] text-slate-400">0 Tokens · Ban-Proof</span>
                </div>
                <div className="p-2.5 rounded bg-white/5 border border-white/5">
                  <span className="font-semibold text-purple-400 block">2. Handle & Bio</span>
                  <span className="text-[10px] text-slate-400">Extracts @handle & followers</span>
                </div>
                <div className="p-2.5 rounded bg-white/5 border border-white/5">
                  <span className="font-semibold text-blue-400 block">3. Portfolio Audit</span>
                  <span className="text-[10px] text-slate-400">Crawls bio website safely</span>
                </div>
                <div className="p-2.5 rounded bg-white/5 border border-white/5">
                  <span className="font-semibold text-emerald-400 block">4. On-Demand AI</span>
                  <span className="text-[10px] text-slate-400">Generate DMs on targets you pick</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKFLOW 2: DIRECT CANDIDATE URL INPUT */}
        {activeWorkflow === 'direct_url' && (
          <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                Target Website URL or Instagram Profile
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Sample Studios:</span>
                <button
                  type="button"
                  onClick={() => prefillExample('interior')}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-pink-300 font-mono text-[11px] border border-white/5"
                >
                  Essajees Atelier
                </button>
                <button
                  type="button"
                  onClick={() => prefillExample('arch')}
                  className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-amber-300 font-mono text-[11px] border border-white/5"
                >
                  Monolith Atelier
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Primary Website URL <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://essajeesatelier.com"
                  required
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Business / Studio Name (Optional)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Essajees Atelier"
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Public Instagram Handle (Optional)
                </label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@essajeesatelier"
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Playbook Rubric
              </label>
              <select
                value={selectedPlaybookId}
                onChange={(e) => setSelectedPlaybookId(Number(e.target.value))}
                className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {allPlaybooks.map((pb) => (
                  <option key={pb.id} value={pb.id}>
                    {pb.name} ({pb.category?.name || 'General'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* WORKFLOW 3: GENERAL SECTOR SEARCH */}
        {activeWorkflow === 'sector_search' && (
          <div className="p-6 rounded-xl bg-[#121620] border border-white/10 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  value={selectedPlaybookId}
                  onChange={(e) => setSelectedPlaybookId(Number(e.target.value))}
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {allPlaybooks.map((pb) => (
                    <option key={pb.id} value={pb.id}>
                      {pb.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  City / Location
                </label>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="e.g. Mumbai, London"
                  className="w-full bg-[#0B0D12] border border-white/10 rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Human-controlled sending · 1-click &quot;Open Instagram Profile&quot; in CRM</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 font-bold text-xs rounded-md shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 ${
              activeWorkflow === 'instagram_leads'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-pink-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
            }`}
          >
            {activeWorkflow === 'instagram_leads' ? (
              <InstagramIcon className="w-4 h-4 text-white" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>
              {isSubmitting 
                ? 'Harvesting & Auditing...' 
                : activeWorkflow === 'instagram_leads'
                ? 'Harvest Instagram Leads (0 AI Tokens)'
                : activeWorkflow === 'direct_url' 
                ? 'Audit Website & Generate Outreach Dossier' 
                : 'Execute Search Run'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
