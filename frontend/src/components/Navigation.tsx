'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Users, 
  Kanban, 
  Send, 
  History, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Plus, 
  Sparkles,
  Flame,
  Sun,
  Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

interface NavigationProps {
  onOpenNewRun: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: typeof Compass;
  badge?: string | number;
  isSprint?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Navigation({ onOpenNewRun }: NavigationProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [pendingFollowUps, setPendingFollowUps] = useState<number>(0);
  const [sprintBadge, setSprintBadge] = useState<string | undefined>(undefined);
  const [providerConfigured, setProviderConfigured] = useState<boolean>(false);

  useEffect(() => {
    api.getFollowUps('pending')
      .then(res => setPendingFollowUps(res?.counts?.total_pending || 0))
      .catch(() => {});

    api.getSprintToday()
      .then(res => {
        if (res?.stats) {
          setSprintBadge(`${res.stats.completed_count}/${res.stats.target_count}`);
        }
      })
      .catch(() => {});

    api.getProviders()
      .then(res => setProviderConfigured(Boolean(res?.ai?.has_api_key)))
      .catch(() => {});
  }, [pathname]);

  const navSections: NavSection[] = [
    {
      title: 'COMMAND',
      items: [
        { label: 'Overview', href: '/', icon: Compass },
        { 
          label: 'Daily Sprint', 
          href: '/sprint', 
          icon: Flame, 
          badge: sprintBadge, 
          isSprint: true 
        },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { label: 'Discover', href: '/discover', icon: Sparkles },
        { label: 'Prospects', href: '/prospects', icon: Users },
        { label: 'Research Runs', href: '/runs', icon: History },
      ]
    },
    {
      title: 'ENGAGEMENT',
      items: [
        { label: 'Pipeline', href: '/pipeline', icon: Kanban },
        { 
          label: 'Outreach & Touches', 
          href: '/outreach', 
          icon: Send, 
          badge: pendingFollowUps > 0 ? pendingFollowUps : undefined 
        },
        { label: 'Playbooks', href: '/playbooks', icon: BookOpen },
      ]
    },
    {
      title: 'STUDIO',
      items: [
        { label: 'Analytics', href: '/analytics', icon: BarChart3 },
        { label: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-black/[0.08] dark:border-white/[0.08] bg-[#FBFBFD]/90 dark:bg-[#0E0E10]/90 backdrop-blur-2xl flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none transition-colors duration-200 z-30">
      
      {/* Top Section */}
      <div className="flex flex-col min-h-0">
        
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-black/[0.08] dark:border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Official Needle-N Logo Mark */}
              <div className="relative w-8 h-8 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/nebulascout_mark_light.png"
                  alt="NebulaScout"
                  className="w-full h-full object-contain block dark:hidden"
                />
                <img
                  src="/nebulascout_mark_dark.png"
                  alt="NebulaScout"
                  className="w-full h-full object-contain hidden dark:block"
                />
              </div>
              
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[#1D1D1F] dark:text-white tracking-tight text-sm">
                    Nebula<span className="text-[#0071E3] dark:text-[#2997FF]">Scout</span>
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#2997FF]/15 dark:text-[#2997FF]">
                    Studio
                  </span>
                </div>
                <p className="text-[10px] text-[#86868B] dark:text-zinc-400 font-medium tracking-wide">
                  Prospect Intelligence
                </p>
              </div>
            </Link>

            {/* Apple-grade Theme Switcher */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-[#1D1D1F]" /> : <Sun className="w-3.5 h-3.5 text-sky-400" />}
            </button>
          </div>

          {/* Quick Action Button: New Research Run */}
          <button
            onClick={onOpenNewRun}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#1D1D1F] hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Research Run</span>
          </button>
        </div>

        {/* Grouped Nav Items */}
        <nav className="p-3 space-y-4 overflow-y-auto flex-1">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider uppercase text-[#86868B] dark:text-zinc-500 select-none">
                {section.title}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isSprint = item.isSprint;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? isSprint
                            ? 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] font-semibold border border-[#0071E3]/25 shadow-xs'
                            : 'bg-black/[0.06] dark:bg-white/[0.08] text-[#1D1D1F] dark:text-white font-semibold shadow-xs'
                          : 'text-[#6E6E73] dark:text-zinc-400 hover:text-[#1D1D1F] dark:hover:text-zinc-100 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive
                            ? isSprint 
                              ? 'text-[#0071E3] dark:text-[#2997FF] fill-[#0071E3] dark:fill-[#2997FF]' 
                              : 'text-[#1D1D1F] dark:text-white'
                            : isSprint
                              ? 'text-[#0071E3]/80 group-hover:text-[#0071E3] dark:text-[#2997FF]/80'
                              : 'text-[#86868B] dark:text-zinc-500 group-hover:text-[#1D1D1F] dark:group-hover:text-zinc-200'
                        }`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${
                          isSprint
                            ? isActive
                              ? 'bg-[#0071E3] text-white font-bold'
                              : 'bg-[#0071E3]/15 text-[#0071E3] dark:text-[#2997FF]'
                            : isActive
                              ? 'bg-black/[0.08] text-[#1D1D1F] dark:bg-white dark:text-neutral-900'
                              : 'bg-black/[0.04] text-[#6E6E73] dark:bg-white/10 dark:text-zinc-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      </div>

      {/* System Telemetry Footer */}
      <div className="p-3.5 border-t border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.08] shadow-xs space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-[#1D1D1F] dark:text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse" />
              <span>Live Engine</span>
            </span>
            <span className="text-[10px] font-mono text-[#86868B]">v2.4 Pro</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#86868B]">
            <span>AI Provider</span>
            <span className="font-mono text-[#6E6E73] dark:text-zinc-400">
              {providerConfigured ? 'Gemini 2.5 Pro' : 'Deterministic'}
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}
