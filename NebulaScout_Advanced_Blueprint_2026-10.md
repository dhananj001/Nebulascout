# NebulaScout — Advanced Product & Engineering Blueprint
## Research-informed build specification for Antigravity

**Document purpose:** This is the authoritative implementation blueprint for NebulaScout, NebulaStack's self-hosted prospect intelligence, research, outreach, and relationship-management system.

**Research snapshot:** 23 October 2026. Versions and provider capabilities change quickly. Before installing dependencies, verify the current stable releases, support policies, SDKs, pricing, and provider terms against the official documentation linked at the end. Do not assume a version number in this document remains the newest patch release.

> **Antigravity instruction:** Inspect the current workspace first. Treat this file as a product and architecture specification, not as a request to create a plan only. Implement the product in working phases, run it locally, test its core workflows, fix errors, and document the exact setup. Preserve existing user work. Do not fabricate integrations, prospect data, results, or successful API calls.

---

# 1. Product vision

Build **NebulaScout**, a self-hosted, AI-assisted prospect intelligence and outreach CRM for **NebulaStack**, a web development and digital-experience agency.

NebulaScout must help the operator:

1. Select any business category, geography, and ideal-client criteria.
2. Discover potential clients through configured and permitted sources.
3. Research businesses and collect source-backed evidence.
4. Identify plausible digital experience or website opportunities.
5. Rank prospects using transparent, configurable criteria.
6. Generate individualized outreach drafts with reasons and citations.
7. Copy a draft, open the relevant profile, send the message manually, and record the exact action.
8. Track replies, follow-ups, meetings, proposals, wins/losses, and learning.
9. Understand which sources, categories, observations, and messages lead to real conversations.
10. Improve the process over time using actual outcomes—not invented AI claims.

Initial use cases include architecture studios, photographers, interior designers, clinics, restaurants, hospitality, event planners, consultants, and custom user-defined categories.

This is an **internal single-operator-first product**, but design the domain and authorization layers so multi-user support can be added without rewriting everything.

## Product principles

- Evidence before inference.
- Specific observations before generic pitches.
- Human-controlled outreach; no automated Instagram DM sending in the initial release.
- AI assists decisions; it does not silently make irreversible actions.
- A research source and timestamp must accompany material claims.
- “Not found” is better than a hallucinated value.
- The operator should quickly understand: **who should I contact next, why, and what should I say?**
- Reliable workflows are more valuable than an impressive but brittle autonomous agent.
- Design for low operational cost, resumability, and replaceable providers.

---

# 2. Research-informed technical direction

## Recommended architecture

Use a **Laravel 13 backend and a separate Next.js frontend**, if the current workspace and runtime support them cleanly.

Why:
- Laravel 13 provides a mature domain/backend foundation, queues, validation, authorization, scheduling, database migrations, and a first-party AI SDK.
- Next.js App Router gives the frontend a modern React/TypeScript environment for rich dashboard UX, streaming where useful, and responsive app navigation.
- A distinct API boundary keeps the frontend replaceable and makes it easier to add another client later.

**Do not duplicate backend business logic in Next.js Server Actions.** Laravel remains the source of truth for business rules, persistence, AI orchestration, and integrations. Next.js should be a UI client with narrowly scoped server-side needs, not a second competing backend.

If the existing workspace already has a sound Laravel + React/Inertia architecture, compare migration cost and keep it if it meets the product needs. Do not rewrite a working application merely to use a fashionable stack.

## Version verification policy

Before scaffolding:
- Verify current stable Laravel 13 patch release and PHP requirement from official Laravel release notes.
- Verify current stable Next.js 16 patch/minor and Node.js requirements from official Next.js documentation.
- Verify current stable React, TypeScript, Tailwind CSS, shadcn/ui-compatible setup, PostgreSQL, Redis, and browser-testing packages.
- Verify the current Laravel AI SDK version and its provider support.
- Verify the current Google Gemini API/SDK and API surface recommended for new applications.
- Verify the chosen search/business-data provider's API terms, limits, and pricing.
- Pin compatible versions in lockfiles; do not install random canary/beta packages in production.
- Use an experimental feature only if the product benefits materially, its status is understood, and a stable fallback exists.

## Suggested stack

### Backend
- Laravel 13, latest compatible stable patch.
- PHP version required by Laravel 13 (verify current official release documentation; Laravel 13 release notes indicate PHP 8.3+).
- Laravel AI SDK (`laravel/ai`) for supported agent/model workflows.
- PostgreSQL as primary database.
- `pgvector` only when semantic retrieval is useful; use native Laravel vector APIs where supported.
- Redis for queues/cache/rate limiting when available; database queue is acceptable for initial local development.
- Laravel scheduler for stale-data refresh and follow-up reminders.
- Laravel policies, Form Requests, API Resources, queues, events, notifications, and rate limiting.
- Pest or PHPUnit for tests; Laravel Pint and static analysis.

### Frontend
- Next.js App Router, current stable compatible version.
- React + TypeScript, strict mode.
- Tailwind CSS with a currently compatible shadcn/ui setup.
- Lucide icons.
- React Hook Form + Zod or the current best compatible form-validation pattern.
- TanStack Table for advanced lead tables if it materially improves UX.
- A small, consistent chart library only for meaningful real analytics.
- Playwright for end-to-end browser tests.
- Vitest/Testing Library where appropriate.

### Local development
- Ubuntu-first setup, with exact version and command checks.
- Docker Compose may be used for PostgreSQL/Redis if helpful, but don't require Docker for the whole app if native services are simpler.
- `.env.example` with placeholders only.
- Seeded demo data must be clearly labelled as demo data.
- Provide scripts/README for setup, run, queue worker, scheduler, tests, lint, build, and reset.

### Do not overengineer
Start with a modular monolith. Do not introduce microservices, Kubernetes, Kafka, a vector database service, or a complex agent framework unless measurable requirements justify them.

---

# 3. Architecture overview

Use clear domain boundaries:

1. **Discovery** — finds candidate businesses through search/business data sources.
2. **Identity resolution** — normalizes and deduplicates businesses.
3. **Research orchestration** — schedules evidence gathering and tracks progress.
4. **Source adapters** — web search, business discovery, website fetch, permitted social metadata, manual URL and CSV imports.
5. **Evidence store** — persists source URLs, excerpts, timestamps, and provenance.
6. **Website audit** — performs safe technical and usability checks.
7. **AI analysis** — synthesizes evidence, identifies opportunities, classifies fit, and drafts messages.
8. **Qualification/scoring** — deterministic, configurable scoring with explanation.
9. **Outreach CRM** — drafts, copied/sent states, replies, follow-ups, meetings, proposals, outcomes.
10. **Analytics/experimentation** — measures outcomes and helps compare approaches.
11. **Settings and governance** — providers, playbooks, costs, retention, privacy, opt-outs.
12. **Frontend app** — dashboard, research runs, prospects, evidence, drafts, pipeline, follow-ups, analytics, settings.

High-level flow:

```text
User search criteria
       |
       v
Discovery providers ---- Manual URL / CSV import
       |                            |
       v                            v
Candidate normalization + identity resolution
       |
       v
Research job orchestration (queue)
       |
       +--> Search results
       +--> Website fetch/audit
       +--> Permitted public business/social metadata
       +--> Publication/project evidence
       |
       v
Evidence normalization + deduplication + provenance
       |
       v
AI synthesis / opportunity analysis / draft generation
       |
       v
Schema validation + source checks + scoring
       |
       v
Prospect profile + outreach draft
       |
       v
Human review -> Copy -> External manual send -> Confirm sent
       |
       v
Reply / follow-up / meeting / proposal / outcome
       |
       v
Analytics and evaluated improvements
```

## Backend API boundary

Use versioned routes such as `/api/v1/...` with consistent response/error formats. Implement:
- Request validation.
- Authentication and CSRF/session approach appropriate to the selected auth design.
- Policies and authorization checks.
- Pagination, filtering, sorting, and stable ordering.
- Rate limits on expensive research and AI endpoints.
- Idempotency keys for long-running run creation or repeated actions where necessary.
- OpenAPI documentation if feasible and maintainable.
- No secrets or internal stack traces in API responses.

## Asynchronous execution

Research and AI jobs can take time. Use queues and explicit run states:
- `queued`
- `running`
- `waiting_for_provider`
- `completed`
- `completed_with_warnings`
- `failed`
- `cancelled`

Store stage progress and useful messages. Support cancellation when safe, retries with backoff, timeouts, partial completion, and resuming from the last completed stage. One failing provider must not destroy all successful evidence from the other providers.

Use unique job/run keys or equivalent idempotency protections so retries do not create duplicate prospects or duplicate outreach actions.

---

# 4. Product navigation and information architecture

Primary navigation:
1. Overview
2. Discover
3. Prospects
4. Research runs
5. Outreach
6. Follow-ups
7. Pipeline
8. Analytics
9. Categories & playbooks
10. Settings

Global elements:
- Global search.
- “New research run” action.
- Provider status indicator.
- Research queue/status indicator.
- Usage/cost indicator if reliable data is available.
- Current follow-up count.
- Clear environment indicator for demo vs real data.

## Overview dashboard

Show actionable, computed information:
- Prospects requiring review.
- Qualified leads ready for contact.
- Drafts awaiting review.
- Follow-ups due and overdue.
- Replies requiring a response.
- Meetings and proposals in progress.
- Recent research runs, status and warnings.
- Pipeline stage counts.
- Recent activity.
- Usage/cost summary if provider data is available.

No hard-coded production metrics. Empty states should guide the user to run research or import prospects.

## Prospect list

Fields:
- Business name
- Category and tags
- Location
- Website and social/profile links
- Fit score
- Opportunity score
- Confidence score
- Pipeline stage
- Last researched
- Last activity
- Next action/date
- Source count or evidence indicator

Support:
- Search, filters, sort, pagination.
- Saved views.
- Bulk tags and safe stage updates.
- CSV export.
- Duplicate warnings.
- “Stale research” indicator.
- Keyboard-friendly row actions.

## Prospect detail

Top of page should answer:
- What is this business?
- Why could it be a fit for NebulaStack?
- What evidence supports the opportunity?
- What is the recommended next action?
- What is the latest outreach status?

Sections:
- Overview and qualification
- Source evidence
- Website/digital presence audit
- Projects/publications
- Opportunities
- Outreach drafts
- Outreach history
- Follow-up schedule
- Notes and tags
- Commercial opportunity
- Full activity timeline

Clearly distinguish:
- **Observed fact**
- **AI-generated interpretation**
- **User-provided note**
- **Unverified hypothesis**
- **Missing data**

---

# 5. Category-aware discovery and playbooks

Category logic must be data-driven and editable. Don't scatter category-specific `if` statements throughout the application.

Each playbook should define:
- Name, slug, description.
- Ideal customer profile.
- Search terms and synonyms.
- Geography defaults.
- Research questions.
- Desired business attributes.
- Evidence sources preferred.
- Opportunity criteria.
- Disqualifiers.
- Scoring weights.
- Preferred services/offer.
- Outreach tone and constraints.
- Message examples and prohibited claims.
- Required vs optional evidence.
- Re-research interval.

Seed playbooks for:

### Architecture studios
Research studio name, principals when reliably published, location, practice type, published projects, editorial features, design philosophy, project storytelling, portfolio structure, enquiry paths, mobile layout, contact details.

Potential opportunities: project narratives, portfolio structure, studio philosophy, enquiry clarity, case-study design, performance/accessibility issues where measured.

### Photographers and videographers
Specialization, portfolio, client types, showreel, booking/enquiry flow, package clarity, testimonials, galleries.

### Interior designers
Residential/commercial focus, projects, process, service clarity, testimonials, enquiries, project narratives.

### Clinics and healthcare practices
Services, location, opening hours, booking flow, accessibility, public credentials where verified. Never infer medical quality or make unsupported clinical claims.

### Restaurants and hospitality
Menu/rooms, location, reservations, booking flow, photography, contact details, accessibility, direct enquiries.

### Event planners and consultants
Portfolio, service packages, enquiry process, testimonials, case studies, target customer clarity.

### Custom category
User can create a playbook with all fields editable in the UI. Allow importing/exporting playbooks as JSON.

---

# 6. Discovery providers and evidence collection

Build interfaces/adapters for:
- Web search.
- Local business discovery.
- Website fetch/crawl.
- Publication and directory discovery.
- Permitted public profile metadata.
- Manual URL.
- CSV import.
- Optional future connectors.

Select the first actual provider based on reliable documentation, coverage for the target geography, terms, cost, and implementation effort. Do not claim that a provider is connected unless a real integration is configured and tested.

## Provider abstraction

Each adapter should expose a consistent result shape with:
- Provider name.
- External identifier, if supplied.
- Candidate business name.
- Website/social URL.
- Location.
- Available contact channel.
- Result title/snippet.
- Source URL.
- Retrieved timestamp.
- Raw provider metadata only when allowed and useful.
- Warnings/limitations.

## Source provenance

Each evidence record should include:
- Prospect ID.
- Source URL.
- Source type/provider.
- Page title.
- Short excerpt or observed fact.
- Retrieved timestamp.
- Publication timestamp if explicitly available.
- Content hash.
- Confidence and evidence type.
- Extraction method and version.
- Status (current, stale, unreachable, superseded).
- Link to the relevant research run.

Do not treat an AI summary as a primary source. Preserve original source references and, when permissible, short excerpts sufficient to explain the finding.

## Discovery and identity resolution

Normalize:
- Website domains.
- URL variants and tracking parameters.
- Instagram/profile URLs.
- Phone formatting only when publicly supplied.
- Business names and locations.

Use deterministic identifiers first, then cautious fuzzy matching. Never merge two prospects solely because their names are similar. Show a merge-review UI for ambiguous cases and retain source history after merges.

## Data rules

- Do not invent names, email addresses, social handles, projects, awards, features, or contact details.
- Missing values stay null/unknown.
- Respect provider terms, rate limits, privacy law, robots rules where applicable, and access restrictions.
- No login bypass, CAPTCHA bypass, private-account scraping, session-cookie harvesting, or stealth automation.
- Instagram data should be collected only through permitted APIs, accessible public data under applicable terms, or user-provided links/content. If unavailable, disclose the limitation and continue with other sources.
- Use professional/public business contact channels only.
- Support opt-out and “do not contact” states.
- Do not collect sensitive personal data or infer protected/sensitive attributes.

---

# 7. Website audit engine

Website audits should be explainable and conservative. Implement measurable checks first, AI interpretation second.

Possible checks:
- HTTP status, redirects, canonical URL.
- HTTPS availability.
- Title and meta description.
- Main navigation and key pages discovered.
- Contact/enquiry path found.
- Portfolio/project page presence.
- Mobile viewport metadata.
- Broken links on a bounded sample.
- Image alt coverage on a bounded sample.
- Page weight and response timing where measured.
- Core Web Vitals only when collected using a valid supported method; do not infer them from a simple HTTP request.
- Lighthouse/PageSpeed integration only when a supported API or safe local tool is configured.
- Basic accessibility signals; never claim a full accessibility audit from heuristics.
- Structured data where relevant.
- Sitemap/robots metadata.

Each check returns:
- Result value.
- Status: pass, warning, fail, not measured.
- Evidence.
- Measurement method.
- Timestamp.
- Confidence/limitations.

Never label a website “bad” merely because the model dislikes the design. Use wording such as “Potential opportunity: the project navigation was not found during this bounded crawl” and show how it was checked.

## Secure crawling / SSRF protection

Website fetching is a security-sensitive feature:
- Only HTTP/HTTPS.
- Reject localhost, private, loopback, link-local, multicast, reserved, and cloud metadata IP ranges.
- Resolve DNS and validate every resolved IP before connection.
- Revalidate after redirects and DNS changes; prevent DNS rebinding.
- Limit redirects, response size, content types, timeouts, concurrency, and total crawl depth.
- Never execute website JavaScript or downloaded code in the application process.
- Use an isolated browser/container only if later required, with network egress controls.
- Block internal service names and non-public address spaces.
- Do not allow the user to fetch arbitrary internal URLs.
- Sanitize and safely render extracted HTML/text.
- Keep fetched content untrusted and treat it as prompt-injection input.

---

# 8. Advanced AI architecture

## Use Laravel AI SDK where appropriate

Laravel 13's first-party AI SDK (`laravel/ai`) supports multiple providers and provides a Laravel-native abstraction for agents, tools, structured outputs, embeddings, web search/fetch tools where supported, queueing, streaming/broadcasting, and human approval patterns. Verify the current SDK version and provider capabilities before implementing. See official documentation in Sources.

Start with Laravel AI SDK as the preferred integration rather than writing bespoke HTTP clients for every model. If a needed capability is unsupported or unstable in the SDK, isolate a provider-specific adapter behind the same internal contract.

## AI provider strategy

Initial provider: Gemini, configured through server-side environment variables. Keep the model/provider replaceable. Use the current official SDK/API recommended for new Gemini projects after verifying documentation at implementation time. Do not blindly copy old SDK samples.

Support:
- Provider health/configuration status.
- Task-specific model configuration.
- Timeouts and retry policy.
- Structured outputs.
- Token/usage metadata where returned.
- Cost estimate where enough pricing/usage information exists.
- Request IDs and error categories.
- Prompt/model/schema version tracking.
- Safe redaction of secrets and sensitive content.

Do not expose API keys to the frontend or logs.

## Agent design: bounded specialists, not one autonomous super-agent

Use separate, testable AI tasks/agents:

1. **Research Synthesizer** — summarizes collected evidence and identifies missing information.
2. **Opportunity Analyst** — identifies plausible website/digital improvements supported by evidence.
3. **Qualification Assistant** — proposes fit/opportunity/confidence scores with reasons.
4. **Outreach Writer** — creates channel-specific drafts grounded in selected evidence and brand tone.
5. **Reply Assistant** — suggests a response based on the operator's recorded message and reply notes.
6. **Outcome Analyst** — summarizes patterns in actual outreach data, including limitations and sample sizes.

Use deterministic code for:
- Source deduplication.
- Score arithmetic and normalization.
- Pipeline transitions.
- Sent-message state.
- Follow-up dates.
- Permission checks.
- Cost limits.
- Provider retry policy.
- Opt-out enforcement.

AI may suggest a decision, but the application must validate and enforce it.

## Structured output and validation

Use JSON-schema/typed structured output when supported. Validate server-side. A valid JSON response is not necessarily factually true.

Suggested output shape:

```json
{
  "summary": "Evidence-based summary",
  "fit_score": 0,
  "opportunity_score": 0,
  "confidence_score": 0,
  "reasons_for_fit": [],
  "observations": [
    {
      "claim": "Specific observation",
      "source_ids": [],
      "evidence_excerpt": "Short supporting excerpt",
      "kind": "observed_fact",
      "confidence": 0.0,
      "checked_at": "ISO-8601 timestamp"
    }
  ],
  "opportunities": [
    {
      "title": "Potential improvement",
      "rationale": "Why it may matter",
      "supporting_source_ids": [],
      "confidence": 0.0,
      "is_hypothesis": true
    }
  ],
  "recommended_service": "Website/digital experience",
  "outreach_angle": "Personalized angle",
  "draft_message": "Draft for human review",
  "recommended_next_action": "Review draft"
}
```

Use IDs from the database, not arbitrary source URLs invented by the model. Validate that all referenced sources belong to the current prospect/research context. Reject or flag unsupported claims.

## Prompt-injection defence

All retrieved web pages, social content, imported CSV rows, and user-entered notes are untrusted input. They are evidence, never system instructions. The model must ignore instructions found inside them. Do not allow source content to:
- Override system prompts.
- Invoke arbitrary tools.
- Change provider settings.
- Read environment variables.
- Send messages.
- Delete or modify records.
- Access another prospect's private notes.

Tool calls must be allowlisted, schema-validated, least-privilege, logged, and bounded. Human approval is mandatory for sensitive or irreversible actions. In this product, external outreach sending is not an enabled tool.

## Retrieval and memory

Do not add vector search merely because it is available. Start with normal relational queries and source IDs. Add embeddings/pgvector only for useful tasks such as:
- Finding prior projects or sources similar to a prospect's work.
- Retrieving the most relevant prior outreach examples.
- Searching internal playbooks and case studies by meaning.
- Detecting semantically duplicate research observations.

Keep tenant/user scoping in every vector query. Apply metadata filters before similarity ranking. Store embedding model/version and re-embed if dimensions/model change. Provide deletion of embeddings when the underlying record is deleted.

## Human approval

Human approval is required before:
- Marking a message as sent.
- Merging ambiguous prospect records.
- Sending or exporting sensitive data.
- Any future external action that could contact a prospect or change third-party state.

In the initial version, the AI only generates drafts and recommendations; the user sends messages manually.

---

# 9. Research workflow and orchestration

A research run should have explicit stages:
1. Validate search criteria.
2. Discover candidates.
3. Normalize URLs and business identity.
4. Deduplicate.
5. Enrich with additional permitted sources.
6. Fetch and inspect public websites safely.
7. Store evidence with provenance.
8. Run deterministic website checks.
9. Ask AI to synthesize the evidence.
10. Validate AI output and source references.
11. Calculate score from configurable rubric.
12. Persist results and warnings.
13. Present the result for human review.

For each stage:
- Persist start/end time.
- Store counts and status.
- Record provider failures and warnings.
- Make retries idempotent.
- Preserve partial results.
- Allow cancel/resume where safe.
- Avoid duplicate AI calls when inputs haven't changed.
- Keep the UI updated via polling initially; add SSE/WebSockets only if there is a demonstrated need.

Implement per-run limits for:
- Number of candidates.
- Number of fetched pages per prospect.
- Maximum page bytes.
- AI tokens/calls.
- Wall-clock duration.
- Provider request rate.
- Estimated spend where measurable.

Add a “quick” mode and “deep research” mode. Quick mode uses fewer sources and a concise analysis; deep mode collects more evidence and produces a richer report. Clearly show what was and wasn't checked.

---

# 10. Scoring and prioritization

Use separate transparent scores from 0–100:
- **Fit score** — match to chosen ideal customer profile.
- **Opportunity score** — strength of evidence for a relevant digital improvement.
- **Confidence score** — completeness and reliability of supporting evidence.

Optional initial fit rubric:
- Service fit: 25
- Evidence-backed opportunity: 30
- Business potential: 20
- Research confidence: 15
- Appropriate public reachability: 10

Make weights editable per playbook and normalize to 100. Treat the rubric as a hypothesis to validate against actual results.

Rules:
- Explain every score.
- Missing data reduces confidence; it never justifies invented facts.
- Do not use sensitive/protected traits.
- Keep score arithmetic deterministic in application code.
- Version the rubric.
- Record manual overrides and reasons.
- Allow a prospect to be “high potential, low confidence” rather than hiding uncertainty in one composite score.
- Use ranking to support human judgment, not automatically disqualify all lower-ranked businesses.

---

# 11. Outreach CRM — exact behavior

## Pipeline stages

- Discovered
- Researching
- Needs review
- Qualified
- Ready to contact
- Draft ready
- Contacted
- Replied
- Follow-up due
- Meeting booked
- Proposal sent
- Won
- Lost
- Not a fit
- Do not contact

## Draft management

Each draft stores:
- Prospect ID.
- Channel.
- Content.
- Draft version and timestamps.
- Provider/model if AI-generated.
- Prompt/playbook version.
- Evidence IDs used.
- Status: draft, reviewed, copied, sent, superseded.
- Operator edits, if feasible.
- Optional notes about the message strategy.

Store the exact sent message separately from the editable draft. Editing a draft after sending must never alter the historical sent content.

## Manual send flow

1. Generate/edit draft.
2. Review source evidence and personalization.
3. Click **Copy message**.
4. Click **Open Instagram/profile** or other appropriate channel.
5. Operator sends externally.
6. Return to NebulaScout and click **Mark as sent**.
7. Confirm channel, sent date/time, and exact text.
8. Optionally create a follow-up task.

Copying does not imply sending. Opening a profile does not imply sending. Never mark contacted unless explicitly confirmed by the operator or a verified future integration.

## Activity timeline

Record events:
- Prospect created/imported.
- Research started/completed/failed.
- Evidence added/refreshed.
- Score created/overridden.
- Draft generated/edited/copied.
- Message manually marked sent.
- Reply manually recorded.
- Follow-up scheduled/completed/skipped.
- Meeting/proposal recorded.
- Stage changed.
- Won/lost with reason.
- Do-not-contact enabled/changed.

Each event should have timestamp, actor, entity, event type, and relevant metadata. Do not store secrets or unnecessary message content in generic logs.

## Follow-up policy

- Follow-up date and reason are operator-configurable.
- Provide due/overdue lists and reminders.
- Generate suggested follow-up drafts using actual recorded history.
- Never send follow-ups automatically.
- Support “not interested,” “no response,” “do not contact,” and “opted out.”
- Prevent routine draft generation and reminders for do-not-contact prospects unless explicitly re-enabled by the operator with a reason.
- Do not encourage relentless outreach. Offer conservative default follow-up limits and configurable cadence.

---

# 12. Advanced UX practices

## Visual direction

- Premium, calm, editorial, high-information-density interface.
- Neutral palette, one deliberate accent, clear type scale, strong spacing rhythm.
- Avoid generic admin-template feel, excessive gradients, glassmorphism, glowing borders, decorative charts, and unnecessary motion.
- Use consistent Lucide icons.
- Use responsive layouts, clear hierarchy, and restrained motion.
- Support reduced-motion preference.
- Ensure keyboard navigation, visible focus, semantic labels, sufficient contrast, and accessible dialogs.
- Target WCAG 2.2 AA principles where practical.
- Provide light/dark themes if reliable.
- Use real records, not fake activity metrics.

## Workflow-first UX

- Main CTA is “New research run.”
- Keep prospect list dense enough for comparison, but readable.
- Show evidence and next action without excessive navigation.
- Use skeletons for research progress and explicit partial-result/warning states.
- Show whether data is fresh, stale, missing, or unverified.
- Use undo for safe actions where feasible.
- Confirm destructive actions.
- Avoid long multi-step forms; use progressive disclosure for advanced criteria.
- Use saved views and keyboard shortcuts only if implemented accessibly and documented.
- Use optimistic UI only for reversible operations; reconcile with server state and display errors.
- Keep status changes understandable; do not hide side effects.

## UI component quality

Use reusable components for:
- Prospect score breakdown.
- Evidence/source row.
- Research progress timeline.
- Outreach draft editor.
- Pipeline stage selector.
- Follow-up card.
- Provider status.
- Empty/error/loading state.
- Confirmation dialog.
- Copy action with feedback.
- Activity timeline.
- Filter bar and saved view.

No inert buttons. Every visible core action must work or be clearly disabled with an explanation.

---

# 13. Database model

Create migrations, models, relationships, indexes, factories, and tests. Minimum entities:

- `users`
- `prospects`
- `prospect_identifiers`
- `categories`
- `category_playbooks`
- `research_runs`
- `research_run_steps`
- `research_sources`
- `prospect_observations`
- `website_audits`
- `lead_scores`
- `outreach_drafts`
- `outreach_messages` or `sent_messages`
- `outreach_activities`
- `follow_ups`
- `opportunities`
- `notes`
- `tags` / pivot tables
- `provider_configs` for non-secret preferences only
- `ai_usage_logs`
- `prompt_versions`
- `rubric_versions`
- `saved_views`
- `app_settings`

Consider:
- UUID/ULID identifiers where useful.
- Unique indexes on normalized domains/profile identifiers.
- Foreign keys with deliberate cascade/retention behavior.
- JSON fields only where flexible provider payloads make sense; don't turn the whole schema into unqueryable JSON.
- Append-only history for sent messages and important actions.
- Optimistic concurrency/version checks for edits to drafts.
- Soft deletion only when recovery is valuable and retention expectations are clear.
- User scoping in all queries from the beginning, even if single-user first.

---

# 14. Analytics and learning loop

Measure only actual recorded outcomes:
- Discovered prospects.
- Qualified prospects.
- Drafts generated.
- Messages marked sent.
- Reply rate.
- Positive-reply rate if manually classified.
- Meetings booked.
- Proposals sent.
- Won deals and recorded revenue.
- Conversion by category, source, geography, opportunity type, and message strategy.
- Average time between stages.
- Follow-up completion and overdue count.
- Cost per researched/qualified prospect if reliable cost data exists.

Define denominators explicitly. For example, reply rate uses confirmed sent messages as its denominator, not all discovered prospects. Exclude unsent drafts. Show sample size and “insufficient data” when too few examples exist.

## Learning loop

Store message metadata and outcomes:
- Outreach angle.
- Opening style.
- Mentioned project/evidence.
- Offer type.
- Message length.
- Channel.
- Category.
- Prospect score at send time.
- Outcome classification.

Initially provide descriptive analysis, not claims of causality. Only introduce A/B testing when there are enough prospects and messages to make comparison meaningful. Keep variants controlled and avoid sending duplicate messages to the same person. Do not let the AI silently rewrite the outreach strategy based on tiny samples.

---

# 15. AI cost, reliability, and observability

- Track provider/model/task, request ID, duration, status, token usage where returned, and estimated cost when calculable.
- Redact secrets and unnecessary personal information.
- Set configurable daily and per-run budgets/limits.
- Cache results keyed by content hash, provider/model, prompt version, and schema version.
- Do not cache volatile information indefinitely.
- Implement provider timeouts, retry with exponential backoff and jitter, circuit-breaker behavior where useful, and graceful degradation.
- Distinguish rate-limit, authentication, timeout, invalid-response, and provider-outage errors.
- Avoid retrying non-retryable failures.
- Do not automatically fall back to a different model without logging the change; model differences can change outputs.
- Include a provider status screen and a “test configuration” action.
- Test AI tasks with saved fixtures and fake providers so routine tests do not require paid API calls.
- Keep a small evaluation dataset of anonymized/synthetic examples with expected properties, not a brittle requirement for exact model wording.

---

# 16. Security, privacy, and compliance

Implement:
- Authentication.
- Authorization policies.
- Safe session/CSRF behavior for the chosen Laravel/Next.js architecture.
- Input validation and output escaping.
- Secure secret management via environment/server-side configuration.
- Rate limiting.
- Secure URL fetching/SSRF protection.
- File upload and CSV import validation.
- Request-size and response-size limits.
- Safe redirect handling.
- Audit logs for sensitive actions.
- Backup and restore instructions.
- Data export and deletion.
- Retention policy for research data and provider logs.
- Do-not-contact/opt-out enforcement.
- Least-privilege tool access.
- Prompt-injection defences.
- No arbitrary model-initiated database writes or external actions.

Do not claim compliance with any law without a real assessment. Design for applicable privacy/data-protection and anti-spam requirements in the jurisdictions where the tool is used. Use business-relevant public data, collect only what is needed, and provide a way to correct/delete records.

Never expose a secret in client bundles, HTML, browser storage, logs, error reports, source control, or AI prompts.

---

# 17. Settings and integrations

Settings sections:
- AI provider/model and status.
- Research/search provider status.
- Business discovery provider status.
- Default category/playbook.
- NebulaStack service catalogue and value propositions.
- Brand voice and writing constraints.
- Pricing/offer notes, configurable by user.
- Research depth and source limits.
- Daily and per-run AI usage limits.
- Follow-up cadence.
- Theme.
- Data export/deletion.
- App version and system health.

Store secrets only in environment variables or a secure server-side secret store. Do not store raw API keys in ordinary database settings. Show “configured / missing / invalid” status without revealing the secret value.

Support manual URL research even when all third-party providers are unconfigured.

---

# 18. Import/export and day-to-day operation

- CSV import with preview, column mapping, validation, duplicate detection, and an error report.
- CSV export respecting active filters and selected columns.
- Manual prospect creation.
- Manual notes, tags, and source URLs.
- Bulk tagging/stage changes.
- Global search.
- Saved views such as “Architecture — Pune,” “Ready to contact,” “Follow-up due,” and “High opportunity, low confidence.”
- Re-research stale prospects.
- Import/export playbooks.
- Archive/restore with clear retention behavior.
- Keyboard-friendly copy/open/mark-sent actions.
- Optional local backup command and restore guide.

---

# 19. Testing and quality gates

## Backend tests
- Prospect CRUD, filters, and user scoping.
- Duplicate detection and safe merge workflow.
- Research job state transitions and idempotency.
- Source evidence provenance.
- Website fetch SSRF protections.
- AI schema validation and source-reference validation.
- Score arithmetic and rubric versioning.
- Draft versioning.
- Copy action does not mark sent.
- Mark-sent stores exact text/channel/time.
- Follow-up scheduling and do-not-contact enforcement.
- CSV import/export validation.
- API rate limiting and authorization.
- Provider failures and retry behavior.

## Frontend tests
- Form validation.
- Prospect filters and saved views.
- Research progress/warning states.
- Draft editing and copy feedback.
- Mark-sent confirmation.
- Follow-up scheduling.
- Accessible navigation and dialogs.
- Responsive layout.

## End-to-end tests
Using Playwright, exercise:
1. Sign in.
2. Create a category/playbook.
3. Create a research run or manually add a prospect.
4. Add/inspect evidence.
5. Generate an AI draft using a fake provider or configured real provider.
6. Copy draft.
7. Confirm it is still unsent.
8. Mark as sent.
9. Record a reply and schedule a follow-up.
10. Move the prospect to meeting/proposal/won.
11. Confirm analytics update from actual records.

## Build quality gates
- Clean migrations from an empty database.
- Seeders work.
- Backend tests pass.
- Frontend tests/lint/type checks pass.
- Production build passes.
- No API keys in frontend output.
- No core placeholder buttons.
- No fabricated integrations or live results.
- No major console/runtime errors.
- README has exact install/run/test commands.
- Critical flow tested in a real browser.

---

# 20. Implementation phases

Do not try to build all advanced features at once. Deliver usable increments.

## Phase 0 — Environment and architecture check
- Inspect workspace and installed PHP/Composer/Node/npm/pnpm/PostgreSQL/Redis.
- Inspect existing code and preserve it.
- Check official version/support documentation.
- Create an implementation checklist and architecture note.
- Identify any necessary local Antigravity skills/rules; install only relevant maintained skills locally if the environment supports it.
- Document decisions and assumptions.

## Phase 1 — Foundation and design system
- Set up Laravel 13 backend and Next.js frontend only if compatible with the existing workspace.
- Configure auth, API boundary, database, migrations, logging, error handling, reusable UI tokens/components.
- Add `.env.example`.
- Make health/status screen.
- Verify clean setup and production builds.

## Phase 2 — CRM-first workflow
- Prospects, categories, playbooks, tags, notes.
- Pipeline and activity timeline.
- Outreach drafts, copy, open profile, mark sent, exact sent text.
- Follow-ups, replies, meetings, proposals, outcomes.
- CSV import/export.
- Automated tests for the core workflow.

## Phase 3 — Research engine
- Provider interfaces and at least one actual documented search/business discovery provider if credentials are available.
- Manual URL and CSV research.
- Secure website fetcher and deterministic audits.
- Evidence/provenance model.
- Background runs, progress, retries, partial results, duplicate resolution.
- Provider failure UI.

## Phase 4 — AI layer
- Laravel AI SDK integration and Gemini configuration.
- Research synthesis, opportunity analysis, scoring explanation, outreach drafting.
- Structured output validation and source verification.
- Prompt versioning, caching, usage logs, budgets, test doubles.
- Prompt-injection controls.
- No automatic outreach sending.

## Phase 5 — Advanced features
- Category playbook editor.
- Saved views and configurable scoring.
- Optional embeddings/pgvector after validating a real retrieval use case.
- Reply assistance.
- Outcome analytics and basic message-strategy comparison.
- Stale-data refresh and scheduled follow-up reminders.
- Optional real-time progress only if polling is insufficient.

## Phase 6 — Product polish and verification
- Refine UI hierarchy, responsive states, empty/loading/error states and accessibility.
- Run automated checks and browser E2E flow.
- Fix issues, don't just list them.
- Review security, provider terms, and secret handling.
- Complete setup/troubleshooting documentation.
- Verify a fresh local setup from README instructions.

---

# 21. Definition of done

NebulaScout is usable on the user's Ubuntu machine and supports:

1. Category/location search criteria.
2. Manual/imported prospects.
3. At least one real discovery integration when its credentials are configured.
4. Safe website research and source-backed evidence.
5. Category-specific opportunity analysis.
6. Transparent scores and uncertainty.
7. Personalized outreach drafts.
8. One-click copy and open-profile actions.
9. Explicit manual send confirmation and immutable sent-message history.
10. Replies, follow-ups, meetings, proposals, outcomes, and full timeline.
11. Filters, saved views, CSV import/export.
12. Gemini API configuration without key leakage.
13. Usage limits, failure states, and research progress.
14. Automated tests and successful production builds.
15. Clear README setup, test, provider, backup, and troubleshooting instructions.

If external credentials are missing, finish the rest of the product and provide a truthful manual/demo path. Never fabricate a successful API response.

---

# 22. Final Antigravity execution instructions

- Start by inspecting the actual workspace and environment.
- Make sensible, reversible choices; don't ask the user about every minor decision.
- Use official documentation and maintained dependencies.
- Install a project-local skill only if it has a clear, relevant benefit and the environment supports local installation. Document the skill and why it was used. Do not install arbitrary global packages.
- Implement real features; do not stop at wireframes or static screens.
- Run tests and builds, fix errors, and exercise the key workflow in a browser.
- Keep an updated checklist in `docs/IMPLEMENTATION_PLAN.md`.
- Add `docs/ARCHITECTURE.md`, `docs/PROVIDERS.md`, and `docs/SECURITY.md` as the implementation develops.
- At completion report:
  1. Implemented features.
  2. Architecture and version choices.
  3. Exact setup/run/test commands.
  4. Required API keys and how to obtain them.
  5. Tests/builds run and results.
  6. Known limitations and next recommended improvements.

**Begin by inspecting the workspace and official version documentation. Then implement the phases until the application is genuinely usable.**

---

# 23. Official research references

Use these as starting points and verify them again at implementation time.

## Laravel 13
- Release notes and support policy: https://github.com/laravel/docs/blob/13.x/releases.md
- Laravel documentation: https://laravel.com/docs/13.x
- Laravel AI SDK docs: https://laravel.com/docs/13.x/ai-sdk
- Laravel AI SDK overview: https://laravel.com/ai

Laravel 13 release notes describe a first-party AI SDK, semantic/vector search capabilities, queue routing, security updates, and PHP 8.3+ requirement. The AI SDK docs cover agents, structured output, tools, web search/fetch, human approval, embeddings, vector stores, provider support, and testing. Use the official current docs rather than relying on summaries in this file.

## Next.js
- Next.js 16 release: https://nextjs.org/blog/next-16
- Next.js blog/release updates: https://nextjs.org/blog
- App Router docs: https://nextjs.org/docs/app
- Support policy: https://nextjs.org/support-policy

Next.js 16 release materials describe Cache Components, Partial Prerendering, Turbopack, React Compiler support, updated caching APIs, and `proxy.ts` replacing the old middleware naming convention. Verify current version details and migration guidance before use.

## Gemini
- Gemini Interactions API overview: https://ai.google.dev/gemini-api/docs/interactions-overview
- Structured outputs: https://ai.google.dev/gemini-api/docs/structured-output
- Tools/function calling: https://ai.google.dev/gemini-api/docs/tools
- API key setup: https://aistudio.google.com/apikey

Google's documentation describes structured output for schema-shaped responses and function calling for tool interactions. The Interactions API documentation states it is generally available and recommended for new projects as of June 2026; confirm that recommendation, supported models, SDK methods, pricing, data-use terms, and region availability before implementation.

## Security and web practices
- OWASP SSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

## Instagram/Meta
- Meta Instagram Platform docs: https://developers.facebook.com/docs/instagram-platform/
- Meta Platform Terms and relevant API policies: verify current terms directly on Meta's official developer documentation.

Do not assume Instagram provides unrestricted access to all public profiles, followers, emails, posts, or third-party messages. Build permitted-source adapters and manual fallback paths; do not make unrestricted scraping or automated DM sending a core dependency.
