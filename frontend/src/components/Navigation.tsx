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
  Sun,
  Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

interface NavigationProps {
  onOpenNewRun: () => void;
}

export function Navigation({ onOpenNewRun }: NavigationProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [pendingFollowUps, setPendingFollowUps] = useState<number>(0);
  const [providerConfigured, setProviderConfigured] = useState<boolean>(false);

  useEffect(() => {
    api.getFollowUps('pending')
      .then(res => setPendingFollowUps(res?.counts?.total_pending || 0))
      .catch(() => {});

    api.getProviders()
      .then(res => setProviderConfigured(Boolean(res?.ai?.has_api_key)))
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { label: 'Overview', href: '/', icon: Compass },
    { label: 'Discover', href: '/discover', icon: Sparkles },
    { label: 'Prospects', href: '/prospects', icon: Users },
    { label: 'Pipeline', href: '/pipeline', icon: Kanban },
    { label: 'Outreach & Follow-ups', href: '/outreach', icon: Send, badge: pendingFollowUps > 0 ? pendingFollowUps : undefined },
    { label: 'Research Runs', href: '/runs', icon: History },
    { label: 'Playbooks', href: '/playbooks', icon: BookOpen },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-black/[0.06] dark:border-white/[0.08] bg-[#FBFBFD] dark:bg-[#0E0E10] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none transition-colors duration-200">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 flex items-center justify-center text-white dark:text-neutral-950 font-semibold text-sm shadow-sm group-hover:scale-[1.02] transition-transform">
                N
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-neutral-900 dark:text-white tracking-tight text-sm">NebulaScout</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-neutral-200/70 dark:bg-white/10 text-neutral-600 dark:text-neutral-300">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-normal">Studio Intelligence</p>
              </div>
            </Link>

            {/* Apple-style Theme Switcher */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

          {/* Quick Action - Apple style pill button */}
          <button
            onClick={onOpenNewRun}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-xs rounded-xl shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Research Run</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-black/[0.06] dark:bg-white/[0.08] text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0071E3] dark:text-[#2997FF]' : 'text-neutral-400 dark:text-neutral-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#2997FF]/20 dark:text-[#2997FF] font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer - Minimal, quiet Apple styling */}
      <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] text-[11px] text-neutral-500 dark:text-neutral-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${providerConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            Gemini AI
          </span>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {providerConfigured ? 'Ready' : 'Deterministic'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Audit Engine
          </span>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Active</span>
        </div>
      </div>
    </aside>
  );
}
