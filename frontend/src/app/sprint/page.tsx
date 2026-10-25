'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { 
  Flame, 
  Send, 
  ExternalLink, 
  Check, 
  Clock, 
  MessageCircle, 
  Phone, 
  Mail, 
  Globe, 
  Trash2, 
  Trophy, 
  MessageSquare, 
  Sliders, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Target,
  Calendar as CalendarIcon,
  Zap,
  ChevronRight
} from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';
import { 
  api, 
  SprintResponse, 
  FollowUp, 
  Prospect 
} from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

function LinkedInIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z"/>
    </svg>
  );
}

export default function DailySprintPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sprintData, setSprintData] = useState<SprintResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Tab view: 'all' vs 'follow_ups'
  const [activeTab, setActiveTab] = useState<'all' | 'follow_ups'>('all');

  // Sound Engine (Subtle Apple-grade haptics)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = useCallback((freq = 587.33, freq2 = 880) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq2, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio fallback silent
    }
  }, [soundEnabled]);

  const playClick = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio fallback silent
    }
  }, [soundEnabled]);

  // 30-Min Focus Sprint Timer
  const [sprintTimerActive, setSprintTimerActive] = useState(false);
  const [sprintSecondsLeft, setSprintSecondsLeft] = useState(30 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (sprintTimerActive && sprintSecondsLeft > 0) {
      interval = setInterval(() => {
        setSprintSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (sprintSecondsLeft === 0 && sprintTimerActive) {
      setSprintTimerActive(false);
      playChime(659.25, 1318.51);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sprintTimerActive, sprintSecondsLeft, playChime]);

  const toggleSprintTimer = () => {
    playClick();
    setSprintTimerActive(!sprintTimerActive);
  };

  const resetSprintTimer = () => {
    playClick();
    setSprintTimerActive(false);
    setSprintSecondsLeft(30 * 60);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Manual Outreach Logger State
  const [businessName, setBusinessName] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'instagram_dm' | 'phone_call' | 'email' | 'linkedin'>('whatsapp');
  const [contactHandle, setContactHandle] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [pitchNotes, setPitchNotes] = useState('');
  const [followUpDays, setFollowUpDays] = useState(3);
  
  const pitchTemplates = [
    { label: 'Mobile Audit', text: 'Sent 45s breakdown of their slow mobile loading and bouncing inquiries.' },
    { label: 'Portfolio Concept', text: 'Shared an interactive bespoke concept demo designed specifically for their projects.' },
    { label: 'Speed & SEO', text: 'Offered complimentary optimization for their slow gallery case studies.' },
    { label: 'Project Compliment', text: 'Complimented their latest work; shared a modern web design presentation.' },
  ];

  // Modals
  const [replyModalProspect, setReplyModalProspect] = useState<Prospect | null>(null);
  const [replySentiment, setReplySentiment] = useState<'interested' | 'curious' | 'not_now' | 'not_interested'>('interested');
  const [replyText, setReplyText] = useState('');
  const [nextFollowUpDays, setNextFollowUpDays] = useState(2);

  const [followUpModalItem, setFollowUpModalItem] = useState<FollowUp | null>(null);
  const [followUpSentText, setFollowUpSentText] = useState('');
  const [followUpTouchDays, setFollowUpTouchDays] = useState(3);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [targetGoalInput, setTargetGoalInput] = useState(25);
  const [showVictory, setShowVictory] = useState(false);

  const loadSprint = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSprintToday();
      setSprintData(data);
      if (data?.stats?.target_count) {
        setTargetGoalInput(data.stats.target_count);
      }
    } catch (err) {
      console.error('Failed to load daily sprint:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadSprint();
  }, [loadSprint]);

  const handleLogReachout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.logReachout({
        business_name: businessName.trim(),
        channel,
        contact_handle: contactHandle.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        pitch_notes: pitchNotes.trim() || undefined,
        schedule_follow_up_days: followUpDays,
      });

      setSprintData(res);
      playChime(523.25, 783.99); // Joyful confirmation chime

      // Check for goal completion
      if (res.stats && res.stats.completed_count >= res.stats.target_count && res.stats.completed_count === res.stats.target_count) {
        setShowVictory(true);
      }

      // Reset form fields
      setBusinessName('');
      setContactHandle('');
      setWebsiteUrl('');
      setPitchNotes('');
    } catch (err) {
      console.error('Failed to log reachout:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordReply = async () => {
    if (!replyModalProspect) return;

    try {
      setSubmitting(true);
      const res = await api.recordSprintReply({
        prospect_id: replyModalProspect.id,
        reply_sentiment: replySentiment,
        reply_text: replyText.trim() || undefined,
        next_follow_up_days: replySentiment !== 'not_interested' ? nextFollowUpDays : undefined,
      });

      setSprintData(res);
      setReplyModalProspect(null);
      setReplyText('');
      playChime(659.25, 1046.50);
    } catch (err) {
      console.error('Failed to record reply:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmFollowUpSent = async () => {
    if (!followUpModalItem) return;

    try {
      setSubmitting(true);
      const res = await api.logSprintFollowUpSent({
        follow_up_id: followUpModalItem.id,
        channel: followUpModalItem.prospect?.phone ? 'whatsapp' : 'instagram_dm',
        sent_text: followUpSentText.trim() || 'Follow-up touchpoint sent',
        next_follow_up_days: followUpTouchDays,
      });

      setSprintData(res);
      setFollowUpModalItem(null);
      setFollowUpSentText('');
      playChime(587.33, 880);
    } catch (err) {
      console.error('Failed to log follow-up sent:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Remove this logged reachout from today?')) return;
    try {
      const res = await api.deleteSprintItem(itemId);
      setSprintData(res);
      playClick();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSubmitting(true);
      const res = await api.updateSprintTarget({
        target_count: Number(targetGoalInput),
      });
      setSprintData(res);
      setShowSettings(false);
      playClick();
    } catch (err) {
      console.error('Failed to update target:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = sprintData?.stats;
  const target = stats?.target_count || 25;
  const completed = stats?.completed_count || 0;
  const progressPercent = Math.min(100, stats?.progress_percent || 0);
  const streak = stats?.streak_count || 1;
  const calendar = sprintData?.calendar || [];
  const loggedItems = sprintData?.sprint?.items || [];
  const dueFollowUps = sprintData?.follow_ups?.due_today || [];

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[parseInt(parts[1], 10) - 1] || parts[1];
      const day = parseInt(parts[2], 10);
      return `${month} ${day}`;
    }
    return dateStr;
  };

  // Circular gauge calculations
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  if (!mounted || (loading && !sprintData)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-[#1D1D1F] dark:border-t-white animate-spin" />
        <p className="text-xs text-[#86868B] dark:text-zinc-500 font-medium">Preparing Daily Sprint Canvas...</p>
      </div>
    );
  }

  const heroBgSrc = theme === 'dark' ? '/sprint_hero_dark.jpg' : '/sprint_hero_light.jpg';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 pb-32">
      
      {/* ── 1. COMMAND FOCUS HERO (Apple Studio Canvas) ── */}
      <div className="relative overflow-hidden rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white/50 dark:bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:shadow-2xl">
        
        {/* Layer 1: Custom Generated Sprint Kinetic Ribbon Artwork */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={heroBgSrc}
            alt="Luminous cool blue glass ribbons and telemetry caustics"
            className="w-full h-full object-cover object-[center_35%] opacity-85 dark:opacity-40 contrast-[1.12] brightness-[1.0] select-none"
          />
          {/* Layer 2: Optical Radial Spotlight Mask for perfect Apple text contrast */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_40%_45%,rgba(255,255,255,0.92)_25%,rgba(255,255,255,0.65)_60%,rgba(244,246,249,0.15)_100%)] dark:bg-[radial-gradient(ellipse_75%_65%_at_45%_40%,rgba(18,24,36,0.96)_30%,rgba(18,24,36,0.82)_65%,rgba(8,11,17,0.5)_100%)]" />
          {/* Layer 3: Cool Ambient Edge Wash */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-white/40 dark:from-[#080B11]/90 dark:via-transparent dark:to-[#121824]/40" />
        </div>

        {/* Subtle decorative background glows */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl z-0" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-cyan-500/8 dark:bg-cyan-500/12 blur-3xl z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          {/* Left Column: Heading, Mental Anchor & Session Tools */}
          <div className="space-y-4 max-w-xl">
            {/* Top Badge & Streak */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] border border-[#0071E3]/25">
                <Zap className="w-3.5 h-3.5 fill-[#0071E3] text-[#0071E3] dark:fill-[#2997FF] dark:text-[#2997FF] animate-pulse" />
                <span>{streak}-Day Active Streak</span>
              </span>

              <span className="text-xs text-[#64748B]">•</span>
              
              <span className="text-xs font-medium text-[#64748B] dark:text-zinc-400">
                Independent Outreach Focus
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">
                Daily Sprint
              </h1>
              <p className="text-sm text-[#64748B] dark:text-zinc-400 mt-1.5 leading-relaxed">
                Consistency compounds. Record every real-world pitch sent today to maintain momentum and build conversation pipeline.
              </p>
            </div>

            {/* Quick Session Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              
              {/* 30-Min Focus Sprint Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F4F8] dark:bg-zinc-800/80 border border-black/[0.06] dark:border-zinc-700/60 shadow-xs">
                <button
                  type="button"
                  onClick={toggleSprintTimer}
                  className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#1D1D1F] dark:text-zinc-200 hover:text-black dark:hover:text-white transition-colors"
                  title={sprintTimerActive ? 'Pause sprint timer' : 'Start 30-min focus sprint'}
                >
                  {sprintTimerActive ? (
                    <Pause className="w-3.5 h-3.5 fill-[#0071E3] text-[#0071E3] dark:fill-[#2997FF] dark:text-[#2997FF]" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-[#0071E3] text-[#0071E3] dark:fill-[#2997FF] dark:text-[#2997FF]" />
                  )}
                  <span>{formatTimer(sprintSecondsLeft)}</span>
                </button>

                {sprintSecondsLeft < 30 * 60 && (
                  <button
                    type="button"
                    onClick={resetSprintTimer}
                    className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-zinc-200 transition-colors"
                    title="Reset timer to 30:00"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sound Haptics Toggle */}
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  playClick();
                }}
                className={`p-2 rounded-xl border transition-all ${
                  soundEnabled 
                    ? 'bg-[#0071E3]/10 border-[#0071E3]/25 text-[#0071E3] dark:text-[#2997FF]' 
                    : 'bg-[#F0F4F8] dark:bg-zinc-800/80 border-black/[0.06] dark:border-zinc-700/60 text-[#86868B]'
                }`}
                title={soundEnabled ? 'Audio Chimes Enabled' : 'Audio Muted'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Goal Setting Trigger */}
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2F2F7] dark:bg-zinc-800/80 border border-black/[0.06] dark:border-zinc-700/60 text-xs font-medium text-[#1D1D1F] dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors"
                title="Adjust Daily Target"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Target: {target}</span>
              </button>
            </div>

            {/* Inline Goal Customizer (Toggled) */}
            {showSettings && (
              <div className="pt-2 flex flex-wrap items-center gap-2 animate-fadeIn border-t border-black/[0.06] dark:border-zinc-800">
                <span className="text-xs text-[#86868B]">Pitches goal:</span>
                {[10, 15, 20, 25, 30, 40].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTargetGoalInput(num)}
                    className={`py-1 px-3 text-xs font-mono rounded-lg transition-all ${
                      targetGoalInput === num
                        ? 'bg-[#1D1D1F] text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                        : 'bg-[#F2F2F7] dark:bg-zinc-800 text-[#1D1D1F] dark:text-zinc-400 hover:bg-[#E5E5EA]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={submitting}
                  className="py-1 px-3 bg-[#1D1D1F] dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold rounded-lg ml-auto hover:opacity-90"
                >
                  Save Goal
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Apple-grade Circular Progress Gauge & 7-Day Consistency */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F5F5F7]/80 dark:bg-zinc-950/40 border border-black/[0.06] dark:border-zinc-800/60 shrink-0 min-w-[240px]">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
                {/* Background Ring Track */}
                <circle
                  cx="65"
                  cy="65"
                  r={ringRadius}
                  strokeWidth="8"
                  className="stroke-[#E5E5EA] dark:stroke-zinc-800"
                  fill="transparent"
                />
                {/* Active Animated Progress Arc */}
                <circle
                  cx="65"
                  cy="65"
                  r={ringRadius}
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="stroke-[#0071E3] dark:stroke-[#2997FF] transition-all duration-1000 ease-out"
                  fill="transparent"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>

              {/* Inside Ring Metrics */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="flex items-baseline gap-0.5 font-mono">
                  <span className="text-3xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">
                    {completed}
                  </span>
                  <span className="text-sm text-[#86868B] font-normal">
                    /{target}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868B] mt-0.5">
                  Pitches Sent
                </span>
                <span className="text-[10px] font-mono font-medium text-[#0071E3] dark:text-[#2997FF]">
                  {progressPercent}% Complete
                </span>
              </div>
            </div>

            {/* 7-Day Consistency Dot Matrix */}
            <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-zinc-800/60 w-full flex items-center justify-between px-2">
              {calendar.map((day) => (
                <div key={day.date} className="flex flex-col items-center gap-1" title={`${day.day_label}: ${day.completed_count} pitches`}>
                  <span className="text-[9px] uppercase font-semibold text-[#86868B]">{day.day_label}</span>
                  <div className={`w-2 h-2 rounded-full transition-all ${
                    day.achieved 
                      ? 'bg-[#0071E3] shadow-[0_0_8px_rgba(0,113,227,0.6)]' 
                      : day.has_activity 
                        ? 'bg-sky-400' 
                        : 'bg-[#E5E5EA] dark:bg-zinc-800'
                  }`} />
                  <span className="text-[9px] font-mono text-[#86868B]">{day.completed_count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. SEED-TO-HARVEST TELEMETRY TILES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Completed Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-black/[0.08] dark:border-zinc-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-[#0071E3] dark:text-blue-400 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
              Pitches Sent Today
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-[#1D1D1F] dark:text-white">
                {completed}
              </span>
              <span className="text-xs text-[#86868B] font-mono">
                / {target} target
              </span>
            </div>
            <p className="text-[11px] text-[#86868B]">
              {completed >= target ? 'Daily target hit!' : `${target - completed} more to finish mission`}
            </p>
          </div>
        </div>

        {/* Card 2: Follow-Ups Due */}
        <div 
          onClick={() => {
            if (dueFollowUps.length > 0) setActiveTab('follow_ups');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
            dueFollowUps.length > 0
              ? 'bg-sky-500/5 hover:bg-sky-500/10 border-sky-500/30'
              : 'bg-white dark:bg-zinc-900/60 border-black/[0.08] dark:border-zinc-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            dueFollowUps.length > 0 
              ? 'bg-sky-500/15 text-[#0071E3] dark:text-[#2997FF]' 
              : 'bg-[#F2F2F7] dark:bg-zinc-800 text-[#86868B]'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#86868B] flex items-center justify-between">
              <span>Follow-Ups Due</span>
              {dueFollowUps.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              )}
            </div>
            <div className="text-2xl font-extrabold font-mono text-[#1D1D1F] dark:text-white">
              {dueFollowUps.length}
            </div>
            <p className="text-[11px] text-[#86868B]">
              {dueFollowUps.length > 0 ? 'Touch #2 nudges awaiting message' : 'Inbox zero — all caught up'}
            </p>
          </div>
        </div>

        {/* Card 3: In Discussion */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/60 border border-black/[0.08] dark:border-zinc-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#86868B]">
              In Active Discussion
            </div>
            <div className="text-2xl font-extrabold font-mono text-[#1D1D1F] dark:text-white">
              {stats?.replied_count || 0}
            </div>
            <p className="text-[11px] text-[#86868B]">
              Prospects who answered your reachout
            </p>
          </div>
        </div>

      </div>

      {/* ── 3. FAST OUTREACH LOGGER (Clean, Tactile, Studio Grade) ── */}
      <div className="relative overflow-hidden rounded-3xl bg-white/50 dark:bg-zinc-900/80 backdrop-blur-xl border border-black/[0.08] dark:border-zinc-800/90 p-6 sm:p-7 shadow-[0_2px_16px_rgba(15,23,42,0.04)] dark:shadow-sm space-y-5">
        
        {/* Subtle Kinetic Ribbon Backdrop */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={heroBgSrc}
            alt="Subtle cool blue ribbon"
            className="w-full h-full object-cover object-right opacity-70 dark:opacity-25 contrast-[1.12] select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/20 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-900/70" />
        </div>

        {/* Logger Header & Channel Switcher */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F] dark:text-white tracking-tight flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#0071E3] dark:text-[#2997FF]" />
              <span>Report a Reachout Sent</span>
            </h2>
            <p className="text-xs text-[#86868B] dark:text-zinc-400 mt-0.5">
              Sent a manual message? Enter the prospect details below to log progress and schedule follow-ups.
            </p>
          </div>

          {/* Segmented Channel Buttons */}
          <div className="p-1 rounded-2xl bg-[#F2F2F7] dark:bg-zinc-800/80 border border-black/[0.06] dark:border-zinc-700/60 flex items-center gap-1 self-start sm:self-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => { setChannel('whatsapp'); playClick(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                channel === 'whatsapp'
                  ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-zinc-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => { setChannel('instagram_dm'); playClick(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                channel === 'instagram_dm'
                  ? 'bg-white dark:bg-zinc-900 text-pink-600 dark:text-pink-400 shadow-sm font-semibold'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-zinc-200'
              }`}
            >
              <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
              <span>Instagram</span>
            </button>

            <button
              type="button"
              onClick={() => { setChannel('phone_call'); playClick(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                channel === 'phone_call'
                  ? 'bg-white dark:bg-zinc-900 text-[#0071E3] dark:text-blue-400 shadow-sm font-semibold'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-zinc-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Call</span>
            </button>

            <button
              type="button"
              onClick={() => { setChannel('email'); playClick(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                channel === 'email'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-zinc-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={() => { setChannel('linkedin'); playClick(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                channel === 'linkedin'
                  ? 'bg-white dark:bg-zinc-900 text-sky-600 dark:text-sky-400 shadow-sm font-semibold'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-zinc-200'
              }`}
            >
              <LinkedInIcon className="w-3.5 h-3.5 text-sky-500" />
              <span>LinkedIn</span>
            </button>
          </div>
        </div>

        {/* The Form */}
        <form onSubmit={handleLogReachout} className="relative z-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                Contact or Brand Name *
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Atelier Vastu Architects"
                className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-[#F0F4F8] dark:bg-[#0E131F] border border-slate-300/80 dark:border-white/10 text-[#1D1D1F] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:bg-white dark:focus:bg-[#141B2D] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/25 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                Handle or Phone Number
              </label>
              <input
                type="text"
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
                placeholder={
                  channel === 'whatsapp' || channel === 'phone_call'
                    ? '+91 98765 43210'
                    : channel === 'instagram_dm'
                      ? '@username'
                      : channel === 'linkedin'
                        ? 'linkedin.com/in/username'
                        : 'founder@brand.com'
                }
                className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-[#F0F4F8] dark:bg-[#0E131F] border border-slate-300/80 dark:border-white/10 text-[#1D1D1F] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:bg-white dark:focus:bg-[#141B2D] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/25 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1.5">
                Website URL (Optional)
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="e.g. ateliervastu.com"
                className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-[#F0F4F8] dark:bg-[#0E131F] border border-slate-300/80 dark:border-white/10 text-[#1D1D1F] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:bg-white dark:focus:bg-[#141B2D] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/25 font-mono transition-colors"
              />
            </div>
          </div>

          {/* Pitch Note & Templates */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
              Pitch Note / Angle Sent
            </label>
            <input
              type="text"
              value={pitchNotes}
              onChange={(e) => setPitchNotes(e.target.value)}
              placeholder="e.g. Sent 45s screen recording highlighting their mobile load delay and inquiry drop-off"
              className="w-full text-xs py-2.5 px-3.5 rounded-xl bg-[#F0F4F8] dark:bg-[#0E131F] border border-slate-300/80 dark:border-white/10 text-[#1D1D1F] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:bg-white dark:focus:bg-[#141B2D] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/25 transition-colors"
            />

            {/* Quick Angle Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5">
              <span className="text-[10px] font-semibold uppercase text-[#86868B] shrink-0">Quick Fill:</span>
              {pitchTemplates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPitchNotes(tpl.text);
                    playClick();
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-[#1D1D1F] dark:text-zinc-300 font-medium shrink-0 transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-black/[0.06] dark:border-zinc-800/60">
            <div className="flex items-center gap-2 text-xs text-[#86868B]">
              <span>Remind Touch #2 in:</span>
              <select
                value={followUpDays}
                onChange={(e) => setFollowUpDays(Number(e.target.value))}
                className="text-xs py-1.5 px-2.5 rounded-lg bg-[#F2F2F7] dark:bg-zinc-800 border border-black/[0.06] dark:border-zinc-700 text-[#1D1D1F] dark:text-zinc-200 font-medium focus:outline-none"
              >
                <option value={1}>1 day (Urgent)</option>
                <option value={2}>2 days</option>
                <option value={3}>3 days (Standard)</option>
                <option value={5}>5 days</option>
                <option value={7}>1 week</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || !businessName.trim()}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs tracking-tight shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Outreach (+1)</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── 4. WORKFLOW FEED: TODAY'S LOGGED REACHOUTS VS FOLLOW-UPS DUE ── */}
      <div className="space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-black/[0.08] dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-6 text-sm font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab('all'); playClick(); }}
              className={`pb-3 -mb-3.5 transition-colors flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'border-b-2 border-[#1D1D1F] dark:border-white text-[#1D1D1F] dark:text-white'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-zinc-300'
              }`}
            >
              <span>Today's Logged Touches</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-zinc-800 text-[#1D1D1F] dark:text-zinc-400 font-mono">
                {loggedItems.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('follow_ups'); playClick(); }}
              className={`pb-3 -mb-3.5 transition-colors flex items-center gap-2 ${
                activeTab === 'follow_ups'
                  ? 'border-b-2 border-[#1D1D1F] dark:border-white text-[#1D1D1F] dark:text-white'
                  : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-zinc-300'
              }`}
            >
              <span>Follow-Ups Due (Inbox Zero)</span>
              {dueFollowUps.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-[#0071E3] dark:text-[#2997FF] font-mono font-bold">
                  {dueFollowUps.length}
                </span>
              )}
            </button>
          </div>

          <span className="text-xs font-mono text-[#86868B] hidden sm:inline">
            {completed} of {target} logged today
          </span>
        </div>

        {/* TAB 1: ALL LOGGED ITEMS TODAY */}
        {activeTab === 'all' && (
          loggedItems.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-black/[0.08] dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/60 backdrop-blur-md p-6 sm:p-8 shadow-[0_2px_12px_rgba(15,23,42,0.04)] flex flex-col md:flex-row items-center gap-8 text-left">
              
              {/* Left Column: Sapphire & Titanium Precision Compass Artwork */}
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-black/5 dark:border-white/10 group">
                <img
                  src="/sprint_momentum_blue.jpg"
                  alt="Precision Sapphire Directional Sphere"
                  className="w-full h-full object-cover select-none transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-sky-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Focus &bull; Momentum</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Inspiring Copy & Guidance */}
              <div className="space-y-3 max-w-lg">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] border border-[#0071E3]/25">
                  <Target className="w-3.5 h-3.5" />
                  <span>The Art of Direct Pitching</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1D1D1F] dark:text-white">
                  Every high-ticket client starts with single-touch courage
                </h3>

                <p className="text-xs sm:text-sm text-[#6E6E73] dark:text-zinc-400 leading-relaxed">
                  Elite architecture studios, builders, and bespoke brands never buy from automated cold blasts. They respond to genuine creative observation, personalized breakdown videos, and persistent follow-up discipline.
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-[#1D1D1F] dark:text-zinc-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>WhatsApp video or text</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    <span>Instagram portfolio DM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>LinkedIn founder intro</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-3">
              {loggedItems.map((item) => {
                const p = item.prospect;
                const followUp = p?.follow_ups?.find(f => f.status === 'pending');
                const ch = item.preferred_channel;

                return (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-black/[0.08] dark:border-zinc-800/80 hover:border-black/[0.14] dark:hover:border-zinc-700 shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Left: Contact Info + Pitch Notes */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#F2F2F7] dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                        {ch === 'whatsapp' ? <MessageCircle className="w-4 h-4 text-emerald-500" /> :
                         ch === 'instagram_dm' ? <InstagramIcon className="w-4 h-4 text-pink-500" /> :
                         ch === 'phone_call' ? <Phone className="w-4 h-4 text-[#0071E3]" /> :
                         ch === 'linkedin' ? <LinkedInIcon className="w-4 h-4 text-sky-500" /> :
                         <Mail className="w-4 h-4 text-indigo-500" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[#1D1D1F] dark:text-white">
                            {p?.business_name}
                          </span>
                          <span className="text-xs font-mono text-[#86868B]">
                            {p?.phone || (p?.instagram_handle ? `@${p.instagram_handle}` : p?.email) || ''}
                          </span>
                          {p?.primary_url && (
                            <a 
                              href={p.primary_url.startsWith('http') ? p.primary_url : `https://${p.primary_url}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-[#86868B] hover:text-[#0071E3] transition-colors"
                              title="Visit website"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <p className="text-xs text-[#6E6E73] dark:text-zinc-300 italic line-clamp-1">
                          "{p?.sent_messages?.[0]?.exact_sent_text || 'Reachout message sent'}"
                        </p>
                      </div>
                    </div>

                    {/* Right: Status Pill & Direct Action Links */}
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                      {/* Status Chip */}
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        p?.stage === 'meeting_booked'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold'
                          : p?.stage === 'replied'
                            ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold'
                            : p?.stage === 'not_a_fit'
                              ? 'bg-[#F2F2F7] dark:bg-zinc-800 text-[#86868B]'
                              : 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
                      }`}>
                        {p?.stage === 'meeting_booked' ? 'Meeting Booked' :
                         p?.stage === 'replied' ? 'In Discussion' :
                         p?.stage === 'not_a_fit' ? 'Not Interested' :
                         followUp ? `Touch #2 due ${formatDueDate(followUp.due_date)}` : 'Sent'}
                      </span>

                      {/* Direct WhatsApp link */}
                      {p?.phone && (
                        <a
                          href={`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                          title="Open WhatsApp chat"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {/* Direct Instagram link */}
                      {p?.instagram_handle && (
                        <a
                          href={p.instagram_url || `https://instagram.com/${p.instagram_handle.replace(/^@/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-pink-600 hover:bg-pink-500/10 transition-colors"
                          title="Open Instagram profile"
                        >
                          <InstagramIcon className="w-4 h-4" />
                        </a>
                      )}

                      {/* Record Reply button */}
                      <button
                        type="button"
                        onClick={() => {
                          setReplyModalProspect(p || null);
                          playClick();
                        }}
                        className="py-1.5 px-3 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#1D1D1F] dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Reply
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-[#86868B] hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* TAB 2: FOLLOW-UPS DUE */}
        {activeTab === 'follow_ups' && (
          dueFollowUps.length === 0 ? (
            <div className="py-16 text-center space-y-3 rounded-3xl border border-black/[0.08] dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-semibold text-[#1D1D1F] dark:text-zinc-200">
                Inbox Zero — All follow-up touches cleared!
              </h3>
              <p className="text-xs text-[#86868B] max-w-sm mx-auto">
                No prospects are awaiting a touchpoint today. Keep logging new reachouts above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueFollowUps.map((fu) => (
                <div 
                  key={fu.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-sky-500/30 dark:border-sky-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#1D1D1F] dark:text-white">
                        {fu.prospect?.business_name}
                      </span>
                      <span className="text-xs font-mono text-[#86868B]">
                        {fu.prospect?.phone || (fu.prospect?.instagram_handle ? `@${fu.prospect.instagram_handle}` : fu.prospect?.email) || 'Direct'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-[#0071E3] dark:text-[#2997FF]">
                        Nudge Due
                      </span>
                    </div>

                    <p className="text-xs text-[#86868B] dark:text-zinc-400">
                      {fu.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
                    {fu.prospect?.phone && (
                      <a
                        href={`https://wa.me/${fu.prospect.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    {fu.prospect?.instagram_handle && (
                      <a
                        href={fu.prospect.instagram_url || `https://instagram.com/${fu.prospect.instagram_handle.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-pink-500/20 transition-colors"
                      >
                        <InstagramIcon className="w-3.5 h-3.5" />
                        <span>Instagram</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setFollowUpModalItem(fu);
                        setFollowUpSentText('Hey, just following up to see if you had a chance to check my previous note!');
                        playClick();
                      }}
                      className="py-1.5 px-3.5 rounded-xl bg-[#1D1D1F] dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Nudge Sent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReplyModalProspect(fu.prospect || null);
                        playClick();
                      }}
                      className="py-1.5 px-3 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] dark:bg-zinc-800 text-[#1D1D1F] dark:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Replied
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

      </div>

      {/* ── 5. RECORD REPLY MODAL ── */}
      {replyModalProspect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white">
                  Record Reply: {replyModalProspect.business_name}
                </h3>
                <p className="text-xs text-[#86868B] mt-0.5">
                  Update their status based on how they responded.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyModalProspect(null)}
                className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-zinc-200 text-sm font-semibold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Sentiment Choices */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { setReplySentiment('interested'); playClick(); }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  replySentiment === 'interested'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold'
                    : 'border-black/[0.08] dark:border-zinc-800 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="text-xs font-bold text-[#1D1D1F] dark:text-white">🟢 Interested / Book Call</div>
                <div className="text-[10px] text-[#86868B] mt-0.5">Wants website discussion</div>
              </button>

              <button
                type="button"
                onClick={() => { setReplySentiment('curious'); playClick(); }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  replySentiment === 'curious'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-300 font-semibold'
                    : 'border-black/[0.08] dark:border-zinc-800 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="text-xs font-bold text-[#1D1D1F] dark:text-white">🔵 Asking Questions</div>
                <div className="text-[10px] text-[#86868B] mt-0.5">Asked about past work</div>
              </button>

              <button
                type="button"
                onClick={() => { setReplySentiment('not_now'); playClick(); }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  replySentiment === 'not_now'
                    ? 'border-[#0071E3] bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] font-semibold'
                    : 'border-black/[0.08] dark:border-zinc-800 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="text-xs font-bold text-[#1D1D1F] dark:text-white">🔵 Not Right Now</div>
                <div className="text-[10px] text-[#86868B] mt-0.5">Check back in few weeks</div>
              </button>

              <button
                type="button"
                onClick={() => { setReplySentiment('not_interested'); playClick(); }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  replySentiment === 'not_interested'
                    ? 'border-zinc-500 bg-zinc-500/10 text-[#1D1D1F] dark:text-zinc-300 font-semibold'
                    : 'border-black/[0.08] dark:border-zinc-800 hover:bg-[#F5F5F7] dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="text-xs font-bold text-[#1D1D1F] dark:text-white">⚪ Not Interested</div>
                <div className="text-[10px] text-[#86868B] mt-0.5">Close lead politely</div>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                Reply Notes
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                placeholder="What did they write back?"
                className="w-full text-xs p-3 rounded-xl bg-[#F0F4F8] dark:bg-[#0E131F] border border-slate-300/80 dark:border-white/10 text-[#1D1D1F] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] resize-none focus:bg-white dark:focus:bg-[#141B2D] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/25"
              />
            </div>

            {replySentiment !== 'not_interested' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                  Schedule Next Follow-Up:
                </label>
                <select
                  value={nextFollowUpDays}
                  onChange={(e) => setNextFollowUpDays(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#F0F4F8] dark:bg-[#0E131F] border border-slate-300/80 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:bg-white dark:focus:bg-[#141B2D] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF]"
                >
                  <option value={1}>Tomorrow</option>
                  <option value={2}>In 2 days</option>
                  <option value={4}>In 4 days</option>
                  <option value={7}>In 1 week</option>
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplyModalProspect(null)}
                className="py-2 px-4 rounded-xl text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordReply}
                disabled={submitting}
                className="py-2 px-5 rounded-xl bg-[#1D1D1F] dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold shadow-sm hover:opacity-90 cursor-pointer"
              >
                Save Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. FOLLOW-UP NUDGE MODAL ── */}
      {followUpModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-zinc-800 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#1D1D1F] dark:text-white">
              Log Follow-Up Sent to {followUpModalItem.prospect?.business_name}
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                Message Sent
              </label>
              <textarea
                value={followUpSentText}
                onChange={(e) => setFollowUpSentText(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded-xl bg-[#F0F4F8] dark:bg-[#0E131F] border border-slate-300/80 dark:border-white/10 text-[#1D1D1F] dark:text-white placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] resize-none focus:bg-white dark:focus:bg-[#141B2D] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF] focus:ring-2 focus:ring-[#0071E3]/20 dark:focus:ring-[#2997FF]/25"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-1">
                If still no reply, follow up again in:
              </label>
              <select
                value={followUpTouchDays}
                onChange={(e) => setFollowUpTouchDays(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl bg-[#F0F4F8] dark:bg-[#0E131F] border border-slate-300/80 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:bg-white dark:focus:bg-[#141B2D] focus:outline-none focus:border-[#0071E3] dark:focus:border-[#2997FF]"
              >
                <option value={2}>In 2 days</option>
                <option value={3}>In 3 days</option>
                <option value={5}>In 5 days</option>
                <option value={7}>In 1 week</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFollowUpModalItem(null)}
                className="py-2 px-4 rounded-xl text-xs font-medium text-[#86868B] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFollowUpSent}
                disabled={submitting}
                className="py-2 px-5 rounded-xl bg-[#1D1D1F] dark:bg-white text-white dark:text-zinc-950 text-xs font-semibold shadow-sm hover:opacity-90 cursor-pointer"
              >
                Mark Nudge Sent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. VICTORY CELEBRATION MODAL ── */}
      {showVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-zinc-800 p-7 text-center space-y-4 shadow-2xl">
            <div className="relative w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-xl border-2 border-[#0071E3]/40 group">
              <img
                src="/sprint_momentum_blue.jpg"
                alt="Victory Compass"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay" />
              <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-lg bg-[#0071E3] text-white flex items-center justify-center shadow-md">
                <Trophy className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-[#0071E3] dark:text-[#2997FF] uppercase tracking-widest mb-1">
                Goal Mastered
              </div>
              <h2 className="text-2xl font-extrabold text-[#1D1D1F] dark:text-white">
                {completed} Reachouts Completed!
              </h2>
              <p className="text-xs text-[#86868B] dark:text-zinc-400 mt-2 leading-relaxed">
                You hit your daily mission. Consistency compounds into conversations, and conversations compound into closed deals.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowVictory(false)}
              className="w-full py-3 px-4 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-md hover:opacity-95 cursor-pointer"
            >
              Continue Momentum
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
