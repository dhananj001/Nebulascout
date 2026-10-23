# NebulaScout — System Architecture & Engineering Reference

## Overview
NebulaScout is a self-hosted, evidence-first prospect intelligence and outreach CRM built for NebulaStack. It enables systematic discovery, technical auditing, and human-confirmed personalized outreach without fabricating claims or executing uncontrolled autonomous actions.

```text
User Search / URL Entry
        │
        ▼
Identity Resolution & Domain Normalization
        │
        ▼
Research Run Orchestrator (Quick vs Deep)
   ├── SSRF-Safe Website Crawler (Bounded DOM inspection)
   ├── Source Provenance Store (Hash, excerpt, timestamp)
   └── Gemini AI Structured Synthesis (<untrusted_data> envelope)
        │
        ▼
Deterministic Scoring Engine (Fit, Opportunity, Confidence)
        │
        ▼
Prospect Dossier & Outreach Draft Workspace
        │
        ├── Copy Draft (Maintains unsent state)
        ├── Open Profile Link
        └── Confirm Sent Externally (Immutable SentMessage record)
        │
        ▼
CRM Pipeline Stages & Follow-Up Reminders
        │
        ▼
Analytics & Learning Loop (Accurate denominators)
```

---

## 1. Domain Boundaries

### Discovery & Identity Resolution (`App\Services\Research\IdentityResolutionService`)
- Normalizes domains: lowercase, strips `http://`, `https://`, `www.`, ports, paths, and query parameters.
- Normalizes social profiles: converts Instagram handles and URLs into canonical handles.
- Enforces deterministic duplicate checks across domains, URLs, and social handles before creating prospects.

### Website Audit Engine (`App\Services\Audit\WebsiteAuditService`)
- **Strict SSRF Protection:** Pre-connection host and DNS resolution checks blocking loopback (`127.0.0.1`, `::1`), RFC 1918 private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), cloud metadata (`169.254.169.254`), and internal network suffixes (`.internal`, `.local`).
- **Bounded Resource Limits:** 8-second HTTP timeout, 2MB max response ceiling, single safe redirect re-validation.
- **Deterministic Technical Checks:**
  - HTTP status & canonical URL
  - HTTPS encryption status
  - Mobile viewport meta detection
  - Enquiry path discovery (`mailto:`, `tel:`, WhatsApp, contact links)
  - Portfolio / case study structure discovery
  - Image accessibility (`alt` tag coverage percentage)
  - Detected technology stack signals (WordPress, Next.js, Elementor, Squarespace, Wix, Shopify)

### Evidence Store & Provenance
- Every research finding is tied to an explicit `ResearchSource` record containing URL, excerpt, timestamp, and content hash.
- Distinguishes three categories of data:
  1. `observed_fact` — measurable fact directly extracted from a source.
  2. `ai_interpretation` — model-generated synthesis of multiple facts.
  3. `unverified_hypothesis` — plausible improvement opportunity pending client validation.

### Deterministic Scoring Engine (`App\Services\Scoring\ScoringService`)
- 0–100 normalized scores for:
  - **Fit Score:** ICP match, domain presence, specialty match.
  - **Opportunity Score:** Website audit warnings, low alt coverage, missing structured enquiry paths, slow response times.
  - **Confidence Score:** Completeness of verified sources and accessible website crawl.
- Returns a transparent breakdown detailing exact positive factors and missing data penalties.

### AI Layer (`App\Services\Ai\GeminiAiService`)
- Connects to Google Gemini API using structured JSON output.
- **Prompt Injection Defense:** Untrusted evidence is strictly wrapped in `<untrusted_evidence_data>` tags with explicit system instructions to ignore instructions inside evidence tags.
- Logs every AI call into `ai_usage_logs` with prompt/completion tokens, duration in milliseconds, and estimated cost in USD.
- Provides a graceful deterministic fallback when `GEMINI_API_KEY` is unconfigured.

### Outreach CRM Workflow
- **Copy Action:** Sets draft status to `copied` and logs activity, but **never** marks the prospect as contacted.
- **Confirm Sent Action:** Requires explicit operator confirmation of exact text sent, channel, and optional follow-up scheduling. Creates an immutable `SentMessage` record and moves prospect stage to `contacted`.
- **Follow-Up Management:** Due dates, overdue alarms, and completion history.

---

## 2. Database Schema Summary

| Table | Purpose |
|---|---|
| `categories` | Business categories (Architecture, Photography, Interior Design, Clinics, Hospitality, etc.) |
| `category_playbooks` | ICP definitions, search terms, scoring weights, tone, and prohibited claims |
| `prospects` | Central prospect entity with scores, stage, contact channels, and commercial estimates |
| `prospect_identifiers` | Normalised keys for deterministic identity resolution |
| `research_runs` | Research job executions, candidate counts, and log of execution steps |
| `research_sources` | Provenance store for source URLs, excerpts, and hashes |
| `prospect_observations` | Granular claims categorized by fact vs hypothesis |
| `website_audits` | Bounded technical checks (HTTPS, viewport, response time, alt coverage) |
| `opportunities` | Evidence-backed web and digital experience improvement opportunities |
| `outreach_drafts` | Editable channel-specific drafts with version tracking |
| `sent_messages` | Immutable audit log of confirmed sent messages |
| `outreach_activities` | Complete activity timeline of all prospect lifecycle events |
| `follow_ups` | Scheduled reminders with overdue and completion tracking |
| `notes` | Internal operator notes |
| `ai_usage_logs` | Token and cost expenditure logs |

---

## 3. Technology Stack & Versions
- **Backend:** Laravel `13.38.0` (PHP `8.3.31`)
- **Database:** SQLite 3 (Default local database in `database/database.sqlite`)
- **Frontend:** Next.js `16.4.2` App Router with Turbopack (Node.js `v20.20.2`, React `19.3.0`, TypeScript `5.x`)
- **Styling:** Vanilla Tailwind CSS with custom editorial dark palette
- **Icons:** Lucide React icons
