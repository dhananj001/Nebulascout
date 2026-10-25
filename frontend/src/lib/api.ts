const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8000/api/v1`;
  }
  return 'http://127.0.0.1:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  prospects_count?: number;
  playbooks?: CategoryPlaybook[];
}

export interface CategoryPlaybook {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  ideal_customer_profile: string | null;
  search_terms: string[] | null;
  default_geography: string | null;
  research_questions: string[] | null;
  desired_attributes: string[] | null;
  opportunity_criteria: string[] | null;
  disqualifiers: string[] | null;
  scoring_weights: Record<string, number> | null;
  preferred_services: string[] | null;
  outreach_tone: string;
  prohibited_claims: string[] | null;
  sample_messages: Record<string, string> | null;
  re_research_days: number;
  is_default: boolean;
  category?: Category;
}

export interface WebsiteAudit {
  id: number;
  prospect_id: number;
  url: string;
  is_accessible: boolean;
  https_supported: boolean;
  response_time_ms: number | null;
  page_title: string | null;
  meta_description: string | null;
  viewport_meta_found: boolean;
  enquiry_paths_found: string[] | null;
  portfolio_found: boolean;
  broken_links_count: number;
  alt_coverage_percent: number;
  tech_stack_signals: string[] | null;
  status: 'pass' | 'warning' | 'fail';
  check_details: Record<string, string> | null;
  audited_at: string;
}

export interface ResearchSource {
  id: number;
  prospect_id: number;
  research_run_id: number | null;
  source_type: string;
  source_url: string;
  page_title: string | null;
  excerpt: string | null;
  confidence: number;
  status: string;
  retrieved_at: string;
}

export interface ProspectObservation {
  id: number;
  prospect_id: number;
  claim: string;
  evidence_excerpt: string | null;
  kind: 'observed_fact' | 'ai_interpretation' | 'unverified_hypothesis';
  confidence: number;
  supporting_source_ids: number[] | null;
  checked_at: string | null;
}

export interface Opportunity {
  id: number;
  prospect_id: number;
  title: string;
  rationale: string;
  supporting_source_ids: number[] | null;
  confidence: number;
  is_hypothesis: boolean;
}

export interface OutreachDraft {
  id: number;
  prospect_id: number;
  channel: string;
  angle: string | null;
  subject: string | null;
  body: string;
  status: 'draft' | 'reviewed' | 'copied' | 'sent' | 'superseded';
  version: number;
  prompt_version: string | null;
  strategy_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SentMessage {
  id: number;
  prospect_id: number;
  outreach_draft_id: number | null;
  channel: string;
  exact_sent_text: string;
  sent_at: string;
}

export interface OutreachActivity {
  id: number;
  prospect_id: number;
  event_type: string;
  description: string;
  metadata: Record<string, any> | null;
  actor: string;
  created_at: string;
  prospect?: Prospect;
}

export interface FollowUp {
  id: number;
  prospect_id: number;
  due_date: string;
  reason: string;
  status: 'pending' | 'completed' | 'skipped';
  priority: 'low' | 'medium' | 'high';
  suggested_angle: string | null;
  completed_at: string | null;
  prospect?: Prospect;
}

export interface Note {
  id: number;
  prospect_id: number;
  content: string;
  created_at: string;
}

export interface Prospect {
  id: number;
  category_id: number | null;
  category_playbook_id: number | null;
  business_name: string;
  normalized_domain: string | null;
  primary_url: string | null;
  instagram_handle: string | null;
  instagram_url: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  stage: string;
  fit_score: number;
  opportunity_score: number;
  confidence_score: number;
  score_explanation: {
    fit_factors?: string[];
    opportunity_factors?: string[];
    confidence_factors?: string[];
    reachability_factors?: string[];
    calculated_at?: string;
  } | null;
  research_status: string;
  last_researched_at: string | null;
  is_do_not_contact: boolean;
  do_not_contact_reason: string | null;
  commercial_estimate: string | number | null;
  tags: string[] | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  playbook?: CategoryPlaybook;
  sources?: ResearchSource[];
  observations?: ProspectObservation[];
  website_audits?: WebsiteAudit[];
  latest_website_audit?: WebsiteAudit;
  opportunities?: Opportunity[];
  drafts?: OutreachDraft[];
  sent_messages?: SentMessage[];
  activities?: OutreachActivity[];
  follow_ups?: FollowUp[];
  notes?: Note[];
}

export interface ResearchRun {
  id: number;
  category_playbook_id: number | null;
  category_name: string | null;
  location_query: string | null;
  query: string | null;
  mode: 'quick' | 'deep';
  status: 'queued' | 'running' | 'waiting_for_provider' | 'completed' | 'completed_with_warnings' | 'failed' | 'cancelled';
  candidates_found: number;
  prospects_created: number;
  warnings: string[] | null;
  execution_log: Array<{ timestamp: string; message: string }> | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  playbook?: CategoryPlaybook;
}

export interface AnalyticsData {
  summary: {
    total_prospects: number;
    qualified_prospects: number;
    drafts_generated: number;
    confirmed_sent: number;
    replied: number;
    meetings_booked: number;
    proposals_sent: number;
    deals_won: number;
    reply_rate_percent: number;
    meeting_conversion_percent: number;
    won_revenue: number;
    pipeline_value: number;
    has_sufficient_sample: boolean;
  };
  pipeline_stages: Record<string, number>;
  categories: Array<{
    category_id: number;
    name: string;
    prospects_count: number;
    contacted_count: number;
    replied_count: number;
    reply_rate: number | null;
  }>;
  follow_ups: {
    pending: number;
    overdue: number;
  };
  ai_usage: {
    total_calls: number;
    total_tokens: number;
    estimated_spend_usd: number;
  };
  recent_activity: OutreachActivity[];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Health & Providers
  getHealth: () => request<{ status: string; app: string; version: string; database: string }>('/health'),
  getProviders: () => request<{ ai: any; search: any; audit: any; instagram: any }>('/providers'),

  // Analytics
  getAnalytics: () => request<AnalyticsData>('/analytics'),

  // Prospects
  getProspects: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        qs.append(k, String(v));
      }
    });
    return request<{ data: Prospect[]; current_page: number; last_page: number; total: number }>(`/prospects?${qs.toString()}`);
  },
  getProspect: (id: number | string) => request<Prospect>(`/prospects/${id}`),
  createProspect: (data: Partial<Prospect> & { auto_research?: boolean }) => request<Prospect>('/prospects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProspect: (id: number | string, data: Partial<Prospect>) => request<Prospect>(`/prospects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProspect: (id: number | string) => request<{ message: string }>(`/prospects/${id}`, {
    method: 'DELETE',
  }),
  updateStage: (id: number | string, stage: string, notes?: string) => request<Prospect>(`/prospects/${id}/stage`, {
    method: 'POST',
    body: JSON.stringify({ stage, notes }),
  }),
  researchProspect: (id: number | string) => request<Prospect>(`/prospects/${id}/research`, {
    method: 'POST',
  }),
  addNote: (id: number | string, content: string) => request<Note>(`/prospects/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),
  getExportUrl: (stage?: string, category_id?: number | string) => {
    const qs = new URLSearchParams();
    if (stage) qs.append('stage', stage);
    if (category_id) qs.append('category_id', String(category_id));
    return `${API_BASE_URL}/prospects/export?${qs.toString()}`;
  },

  // Research Runs
  getResearchRuns: () => request<{ data: ResearchRun[]; total: number }>('/research-runs'),
  createResearchRun: (data: {
    category_playbook_id?: number | null;
    category_name?: string;
    location_query?: string;
    mode?: 'quick' | 'deep';
    manual_url?: string;
    business_name?: string;
    instagram_handle?: string;
    source_type?: 'instagram' | 'google' | 'all' | 'manual';
  }) => request<ResearchRun>('/research-runs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getResearchRun: (id: number | string) => request<ResearchRun>(`/research-runs/${id}`),

  // Outreach Flow
  generateDraft: (prospectId: number | string, channel = 'instagram_dm') => request<OutreachDraft>(`/outreach/prospects/${prospectId}/draft`, {
    method: 'POST',
    body: JSON.stringify({ channel }),
  }),
  updateDraft: (draftId: number | string, data: { body: string; subject?: string; angle?: string }) => request<OutreachDraft>(`/outreach/drafts/${draftId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  copyDraft: (draftId: number | string) => request<{ message: string; draft: OutreachDraft; channel: string }>(`/outreach/drafts/${draftId}/copy`, {
    method: 'POST',
  }),
  confirmSent: (draftId: number | string, data: {
    exact_sent_text: string;
    channel: string;
    schedule_follow_up_days?: number;
    follow_up_reason?: string;
  }) => request<{ message: string; sent_message: SentMessage; prospect_stage: string }>(`/outreach/drafts/${draftId}/confirm-sent`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  recordReply: (prospectId: number | string, data: {
    channel: string;
    reply_text?: string;
    sentiment: 'positive' | 'neutral' | 'not_interested' | 'opt_out';
    notes?: string;
    new_stage?: string;
  }) => request<{ message: string; prospect: Prospect }>(`/outreach/prospects/${prospectId}/reply`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Follow-Ups
  getFollowUps: (status: 'pending' | 'completed' | 'all' = 'pending') => request<{
    counts: { overdue: number; due_today: number; upcoming: number; total_pending: number };
    overdue: FollowUp[];
    due_today: FollowUp[];
    upcoming: FollowUp[];
    completed: FollowUp[];
  }>(`/follow-ups?status=${status}`),
  createFollowUp: (data: { prospect_id: number; due_date: string; reason: string; priority?: string }) => request<FollowUp>('/follow-ups', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateFollowUp: (id: number | string, data: { status?: string; due_date?: string; reason?: string }) => request<FollowUp>(`/follow-ups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Categories & Playbooks
  getCategories: () => request<Category[]>('/categories'),
  createPlaybook: (data: Partial<CategoryPlaybook>) => request<CategoryPlaybook>('/playbooks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePlaybook: (id: number | string, data: Partial<CategoryPlaybook>) => request<CategoryPlaybook>(`/playbooks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  exportPlaybook: (id: number | string) => request<CategoryPlaybook>(`/playbooks/${id}/export`),

  // Daily Sprint (Manual Outreach Reporting & Follow-Up Tracking)
  getSprintToday: () => request<SprintResponse>('/sprint/today'),
  updateSprintTarget: (data: {
    target_count: number;
    target_niche?: string;
  }) => request<SprintResponse>('/sprint/target', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  logReachout: (data: {
    business_name: string;
    channel: string;
    contact_handle?: string;
    website_url?: string;
    pitch_notes?: string;
    category_name?: string;
    schedule_follow_up_days?: number;
    follow_up_reason?: string;
  }) => request<SprintResponse>('/sprint/log-reachout', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  recordSprintReply: (data: {
    prospect_id: number;
    reply_sentiment: string;
    reply_text?: string;
    next_follow_up_days?: number;
    next_follow_up_reason?: string;
  }) => request<SprintResponse>('/sprint/record-reply', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  logSprintFollowUpSent: (data: {
    follow_up_id: number;
    channel: string;
    sent_text?: string;
    next_follow_up_days?: number;
  }) => request<SprintResponse>('/sprint/log-followup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteSprintItem: (id: number) => request<SprintResponse>(`/sprint/items/${id}`, {
    method: 'DELETE',
  }),
};

export interface DailySprintItem {
  id: number;
  daily_sprint_id: number;
  prospect_id: number;
  sort_order: number;
  status: 'pending' | 'completed' | 'skipped';
  preferred_channel: string;
  skip_reason: string | null;
  completed_at: string | null;
  prospect: Prospect;
}

export interface DailySprint {
  id: number;
  sprint_date: string;
  target_count: number;
  completed_count: number;
  target_niche: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  streak_count: number;
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  items: DailySprintItem[];
}

export interface SprintMilestone {
  label: string;
  threshold: number;
  unlocked: boolean;
}

export interface SprintCalendarDay {
  date: string;
  day_label: string;
  day_num: string;
  is_today: boolean;
  target_count: number;
  completed_count: number;
  achieved: boolean;
  has_activity: boolean;
}

export interface SprintResponse {
  sprint: DailySprint;
  stats: {
    target_count: number;
    completed_count: number;
    progress_percent: number;
    streak_count: number;
    replied_count: number;
    due_follow_ups_count: number;
    milestones: {
      bronze: SprintMilestone;
      silver: SprintMilestone;
      gold: SprintMilestone;
    };
  };
  follow_ups: {
    due_today: FollowUp[];
    upcoming: FollowUp[];
  };
  calendar: SprintCalendarDay[];
}

