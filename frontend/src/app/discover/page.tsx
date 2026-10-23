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
  Check,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api, Category } from '@/lib/api';
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

  // Harvest Live Progress State
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [harvestStage, setHarvestStage] = useState<string>('Initializing');
  const [harvestProgress, setHarvestProgress] = useState<number>(0);
  const [harvestLogs, setHarvestLogs] = useState<Array<{ time: string; text: string; type?: 'info' | 'success' | 'detail' }>>([]);
  const [completedRun, setCompletedRun] = useState<any | null>(null);

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

  const addLog = (text: string, type: 'info' | 'success' | 'detail' = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHarvestLogs(prev => [...prev, { time, text, type }]);
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (activeWorkflow === 'direct_url' && !manualUrl.trim()) {
        throw new Error('Please enter a target website URL or Instagram profile to audit.');
      }

      setIsHarvesting(true);
      setHarvestProgress(15);
      setHarvestStage('Initiating Search & Query Indexing');
      setHarvestLogs([]);
      setCompletedRun(null);

      const targetCity = locationQuery.trim() || 'Global';
      const targetNiche = selectedPlaybook?.name || 'Design Studio';

      addLog(`Selected Niche: "${targetNiche}" in ${targetCity}`);
      if (activeWorkflow === 'instagram_leads') {
        addLog(`Constructing Google X-Ray query: site:instagram.com "${targetNiche}" "${targetCity}"`, 'detail');
        addLog(`Targeting 0-AI-token discovery to preserve budget`, 'info');
      } else if (activeWorkflow === 'direct_url') {
        addLog(`Inspecting candidate URL: ${manualUrl}`, 'detail');
      }

      // Step 2: Call Backend
      setTimeout(() => {
        setHarvestProgress(45);
        setHarvestStage(activeWorkflow === 'instagram_leads' ? 'Scanning Public Instagram Profiles via Serper' : 'Executing SSRF Web Audit');
        if (activeWorkflow === 'instagram_leads') {
          addLog(`Sending query to Google Serper search API...`);
          addLog(`Filtering out aggregator spam and irrelevant directory listings`, 'detail');
        }
      }, 700);

      const run = await api.createResearchRun({
        category_playbook_id: selectedPlaybook ? selectedPlaybook.id : null,
        category_name: selectedPlaybook?.name,
        location_query: locationQuery,
        mode,
        source_type: activeWorkflow === 'instagram_leads' ? 'instagram' : activeWorkflow === 'sector_search' ? 'google' : 'manual',
        manual_url: activeWorkflow === 'direct_url' ? manualUrl.trim() : undefined,
        business_name: businessName.trim() || undefined,
        instagram_handle: instagramHandle.trim() || undefined,
      });

      // Step 3: Parse Execution Logs
      setHarvestProgress(80);
      setHarvestStage('Auditing Bios, Handles & Deduplicating');

      if (run.execution_log && run.execution_log.length > 0) {
        run.execution_log.forEach((entry: any) => {
          addLog(entry.message, entry.message.includes('Created') || entry.message.includes('verified') ? 'success' : 'detail');
        });
      }

      // Step 4: Finished
      setHarvestProgress(100);
      setHarvestStage('Harvest Complete');
      addLog(`Harvest completed successfully! Found ${run.candidates_found} candidates, created ${run.prospects_created} new prospects.`, 'success');
      setCompletedRun(run);

    } catch (err: any) {
      setError(err.message || 'Failed to start research run');
      addLog(`Error: ${err.message || 'Failed to execute run'}`, 'detail');
      setIsHarvesting(false);
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
    <div className="py-10 px-8 max-w-4xl mx-auto space-y-9">
      {/* Editorial Apple Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Studio Discovery
            </h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Live
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
            Discover verified Instagram studio portfolios, audit live websites for redesign hooks, and draft tailored outreach.
          </p>
        </div>

        {/* API Status Drawer Toggle */}
        <button
          onClick={() => setShowKeyInstructions(!showKeyInstructions)}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          <Key className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
          <span>Services</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {showKeyInstructions ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
        </button>
      </div>

      {/* Expandable Provider Diagnostic Card */}
      {showKeyInstructions && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-900 dark:text-white">Connected Engines</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`GEMINI_API_KEY=\nSERPER_API_KEY=`);
                setCopiedKeyEnv(true);
                setTimeout(() => setCopiedKeyEnv(false), 2000);
              }}
              className="text-[11px] text-[#0071E3] dark:text-[#2997FF] hover:underline flex items-center gap-1"
            >
              {copiedKeyEnv ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKeyEnv ? 'Copied template' : 'Copy .env snippet'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between font-medium">
                <span className="text-neutral-800 dark:text-neutral-200">Serper Search Engine</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {hasSearchKey ? 'Verified' : 'Inactive'}
                </span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                Powers 100% ban-proof Google X-Ray discovery for active Instagram studio profiles.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] space-y-1">
              <div className="flex items-center justify-between font-medium">
                <span className="text-neutral-800 dark:text-neutral-200">Google Gemini AI</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {hasGeminiKey ? 'Verified (Flash)' : 'Inactive'}
                </span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                Generates personalized client dossier angles and tailored Instagram DM pitches on demand.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Apple-style Segmented Control for Workflows */}
      <div className="p-1 rounded-2xl bg-neutral-200/60 dark:bg-white/[0.06] flex items-center gap-1 max-w-xl">
        <button
          type="button"
          onClick={() => setActiveWorkflow('instagram_leads')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeWorkflow === 'instagram_leads'
              ? 'bg-white dark:bg-[#1E1E22] text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
          <span>Instagram Harvester</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveWorkflow('direct_url')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeWorkflow === 'direct_url'
              ? 'bg-white dark:bg-[#1E1E22] text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-neutral-500" />
          <span>Direct URL Audit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveWorkflow('sector_search')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeWorkflow === 'sector_search'
              ? 'bg-white dark:bg-[#1E1E22] text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-neutral-500" />
          <span>Web Search</span>
        </button>
      </div>

      {/* Main Execution Form */}
      <form onSubmit={handleLaunch} className="space-y-6">

        {/* WORKFLOW 1: INSTAGRAM HARVESTER */}
        {activeWorkflow === 'instagram_leads' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white tracking-tight">
                Target Studio Category
              </span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                0 AI Tokens Discovery
              </span>
            </div>

            {/* Category selection - Apple style tiles */}
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
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0071E3] dark:border-[#2997FF] bg-[#0071E3]/[0.04] dark:bg-[#2997FF]/[0.08] text-neutral-900 dark:text-white shadow-sm'
                        : 'border-black/[0.06] dark:border-white/[0.06] bg-neutral-50/50 dark:bg-white/[0.02] hover:bg-neutral-100/60 dark:hover:bg-white/[0.04] text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#0071E3] dark:text-[#2997FF]' : 'text-neutral-400'}`} />
                        <span className="font-medium text-xs text-neutral-900 dark:text-white">{cat.name}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {cat.description || 'Targeted criteria and personalized Instagram DM angle.'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Target City & Depth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Target City or Metro Region
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="e.g. Mumbai, London, Dubai, New York"
                    className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
                  />
                </div>
                {/* Popular City Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Mumbai', 'Delhi', 'Bengaluru', 'Dubai', 'London', 'New York'].map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setLocationQuery(city)}
                      className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                        locationQuery === city 
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium' 
                          : 'bg-black/[0.04] dark:bg-white/[0.06] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Batch Discovery Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('quick')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      mode === 'quick'
                        ? 'border-[#0071E3] dark:border-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] font-semibold'
                        : 'border-black/[0.06] dark:border-white/[0.06] bg-neutral-50/50 dark:bg-white/[0.02] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Quick (6 Profiles)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('deep')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      mode === 'deep'
                        ? 'border-[#0071E3] dark:border-[#2997FF] bg-[#0071E3]/10 dark:bg-[#2997FF]/15 text-[#0071E3] dark:text-[#2997FF] font-semibold'
                        : 'border-black/[0.06] dark:border-white/[0.06] bg-neutral-50/50 dark:bg-white/[0.02] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Deep (12 Profiles)</span>
                  </button>
                </div>
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 block">
                  Serper extracts @handle, followers, and bio links. You pick which ones to generate AI pitches for.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* WORKFLOW 2: DIRECT CANDIDATE AUDIT */}
        {activeWorkflow === 'direct_url' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                Candidate Website or Instagram Profile
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-400">Sample Studios:</span>
                <button
                  type="button"
                  onClick={() => prefillExample('interior')}
                  className="px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-neutral-700 dark:text-neutral-300 text-[11px]"
                >
                  Essajees Atelier
                </button>
                <button
                  type="button"
                  onClick={() => prefillExample('arch')}
                  className="px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-neutral-700 dark:text-neutral-300 text-[11px]"
                >
                  Monolith Atelier
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Primary Website URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://essajeesatelier.com"
                  required
                  className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Business / Studio Name (Optional)
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Essajees Atelier"
                  className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Public Instagram Handle (Optional)
                </label>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  placeholder="@essajeesatelier"
                  className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Target Playbook Rubric
              </label>
              <select
                value={selectedPlaybookId}
                onChange={(e) => setSelectedPlaybookId(Number(e.target.value))}
                className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
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
          <div className="p-6 rounded-2xl bg-white dark:bg-[#141416] border border-black/[0.06] dark:border-white/[0.08] shadow-sm space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Category
                </label>
                <select
                  value={selectedPlaybookId}
                  onChange={(e) => setSelectedPlaybookId(Number(e.target.value))}
                  className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
                >
                  {allPlaybooks.map((pb) => (
                    <option key={pb.id} value={pb.id}>
                      {pb.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                  City / Location
                </label>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="e.g. Mumbai, London"
                  className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Primary Action Button - Apple Editorial */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Human-controlled sending · 1-click &quot;Open Instagram Profile&quot; in CRM</span>
          </div>

          <button
            type="submit"
            disabled={isHarvesting}
            className="px-6 py-2.5 font-medium text-xs rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {activeWorkflow === 'instagram_leads' ? (
              <InstagramIcon className="w-3.5 h-3.5 text-white dark:text-neutral-950" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>
              {isHarvesting 
                ? 'Harvesting Leads...' 
                : activeWorkflow === 'instagram_leads'
                ? 'Harvest Instagram Leads'
                : activeWorkflow === 'direct_url' 
                ? 'Audit Website & Generate Dossier' 
                : 'Execute Search Run'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* LIVE HARVEST PROGRESS DRAWER / MODAL */}
      {isHarvesting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#141416] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${completedRun ? 'bg-emerald-500' : 'bg-[#0071E3] animate-pulse'}`} />
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                    {completedRun ? 'Studio Discovery Completed' : 'Harvesting Studio Prospects'}
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {selectedPlaybook?.name || 'Studio'} · {locationQuery || 'Global'} ({mode === 'deep' ? '12 targets' : '6 targets'})
                </p>
              </div>

              {completedRun && (
                <button
                  onClick={() => setIsHarvesting(false)}
                  className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                >
                  ✕ Close
                </button>
              )}
            </div>

            {/* Apple Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  {!completedRun && <span className="inline-block w-3 h-3 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />}
                  <span>{harvestStage}</span>
                </span>
                <span className="font-mono text-neutral-500 dark:text-neutral-400">{harvestProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${completedRun ? 'bg-emerald-500' : 'bg-[#0071E3]'}`}
                  style={{ width: `${harvestProgress}%` }}
                />
              </div>
            </div>

            {/* Live Step-by-Step Terminal / Execution Feed */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                <span>Real-Time Activity Stream</span>
                <span>{harvestLogs.length} events logged</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-black/30 border border-black/[0.04] dark:border-white/[0.04] max-h-52 overflow-y-auto font-mono text-[11px] space-y-1.5">
                {harvestLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-neutral-400 shrink-0 text-[10px]">{log.time}</span>
                    <span className={
                      log.type === 'success' 
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold' 
                        : log.type === 'detail' 
                        ? 'text-neutral-500 dark:text-neutral-400' 
                        : 'text-neutral-800 dark:text-neutral-200'
                    }>
                      {log.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed Summary & CTAs */}
            {completedRun ? (
              <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between gap-3">
                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                  <span className="font-semibold text-neutral-900 dark:text-white">{completedRun.prospects_created || completedRun.candidates_found} new leads</span> ready in directory.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push('/runs')}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-neutral-700 dark:text-neutral-300"
                  >
                    View Audit Logs
                  </button>
                  <button
                    onClick={() => router.push('/prospects')}
                    className="px-4 py-1.5 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Inspect Prospects</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center pt-1">
                Harvesting public Instagram profiles & auditing portfolios safely without token drain...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
