import Link from 'next/link';

export default function LogoShowcasePage() {
  const options = [
    {
      id: 1,
      title: 'Variation 1A: Scout Compass Core',
      description: 'Architectural letter N with a dual-tone celestial scouting needle slicing NE to SW, subtle 360° target radar ring, and precision pivot aperture.',
      svgUrl: '/nebulascout_logo_preview1.svg',
      themeFit: 'Represents exact prospect discovery & coordinate locking.'
    },
    {
      id: 2,
      title: 'Variation 1B: Falcon Needle & Target Pulse',
      description: 'Streamlined twin pillars framing an aerodynamic upward outreach arrow with an active signal pulse arc.',
      svgUrl: '/nebulascout_logo_preview2.svg',
      themeFit: 'Represents outbound momentum and high-ticket touchpoint velocity.'
    },
    {
      id: 3,
      title: 'Variation 1C: Optical Prism Monogram',
      description: 'Faceted geometric N with a razor-sharp navigation needle and electric blue light-catching facets.',
      svgUrl: '/nebulascout_logo_preview3.svg',
      themeFit: 'Represents intelligent prospect auditing, deep clarity, and high-ticket precision.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#080B11] text-[#1D1D1F] dark:text-[#F5F5F7] p-8 sm:p-12 space-y-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-2">
        <Link href="/sprint" className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center gap-1 mb-2">
          &larr; Back to Daily Sprint
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">NebulaScout Brand Identity</h1>
        <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
          Selected Official Logo: Direction 1 (Needle-N Scout Monogram + Matching Wordmark) with custom transparency for Light and Dark modes.
        </p>
      </div>

      {/* Official Approved Lockup Showcase */}
      <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-white dark:bg-[#121824] border-2 border-[#0071E3]/30 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              Active Official Identity
            </span>
            <h2 className="text-xl font-extrabold text-[#1D1D1F] dark:text-white mt-1">
              Option 1: Needle-N Scout Monogram Lockup
            </h2>
          </div>
          <span className="text-xs font-mono font-medium text-[#64748B]">Transparent PNG + Retinal SVG</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Light Mode Preview */}
          <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex flex-col items-center justify-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Light Mode Canvas</span>
            <img src="/nebulascout_logo_light.png" alt="NebulaScout Light" className="h-14 object-contain" />
          </div>

          {/* Dark Mode Preview */}
          <div className="p-8 rounded-2xl bg-[#080B11] border border-white/10 flex flex-col items-center justify-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Dark Mode Canvas</span>
            <img src="/nebulascout_logo_dark.png" alt="NebulaScout Dark" className="h-14 object-contain" />
          </div>
        </div>

        {/* Standalone Mark Icons */}
        <div className="pt-2 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-[#64748B]">Standalone Mark (App Icon &amp; Favicon):</span>
            <img src="/nebulascout_mark_light.png" alt="Mark Light" className="w-8 h-8 object-contain" />
            <img src="/nebulascout_mark_dark.png" alt="Mark Dark" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Active in Sidebar &amp; Favicon</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {options.map((opt) => (
          <div key={opt.id} className="p-6 rounded-3xl bg-white dark:bg-[#121824] border border-black/[0.08] dark:border-white/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white">{opt.title}</h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{opt.description}</p>
              </div>
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]">
                Option #{opt.id}
              </span>
            </div>

            {/* Light canvas preview */}
            <div className="p-6 rounded-2xl bg-[#F8FAFD] border border-slate-200/80 flex items-center justify-center">
              <img src={opt.svgUrl} alt={opt.title} className="h-16 max-w-full object-contain" />
            </div>

            {/* Dark canvas preview */}
            <div className="p-6 rounded-2xl bg-[#0B0E17] border border-white/10 flex items-center justify-center">
              <div className="brightness-125 contrast-125">
                <img src={opt.svgUrl} alt={opt.title} className="h-16 max-w-full object-contain invert dark:invert-0" style={{ filter: 'drop-shadow(0 0 12px rgba(41,151,255,0.15))' }} />
              </div>
            </div>

            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] italic">
              <strong>Core Symbolism:</strong> {opt.themeFit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
