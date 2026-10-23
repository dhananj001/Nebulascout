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
  PlusCircle, 
  Sparkles,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface NavigationProps {
  onOpenNewRun: () => void;
}

export function Navigation({ onOpenNewRun }: NavigationProps) {
  const pathname = usePathname();
  const [pendingFollowUps, setPendingFollowUps] = useState<number>(0);
  const [providerConfigured, setProviderConfigured] = useState<boolean>(false);

  useEffect(() => {
    api.getFollowUps('pending')
      .then(res => setPendingFollowUps(res.counts.total_pending))
      .catch(() => {});

    api.getProviders()
      .then(res => setProviderConfigured(res.ai.has_api_key))
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
    <aside className="w-64 border-r border-white/10 bg-[#0B0D12] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-bold text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-tight text-base">NebulaScout</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">v1.0</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">NebulaStack Intelligence</p>
            </div>
          </Link>

          {/* Quick Action */}
          <button
            onClick={onOpenNewRun}
            className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs rounded-md shadow-md shadow-amber-500/10 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Research Run</span>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-white/10 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${providerConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            Gemini AI
          </span>
          <span className="font-mono text-[10px] text-slate-300">
            {providerConfigured ? 'Connected' : 'Deterministic Mode'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Audit Engine
          </span>
          <span className="font-mono text-[10px] text-emerald-400">SSRF Safe</span>
        </div>
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Human-Controlled Outreach</span>
          <span className="text-amber-400 font-semibold">Active</span>
        </div>
      </div>
    </aside>
  );
}
