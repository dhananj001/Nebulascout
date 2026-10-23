# NebulaScout

> **Self-hosted, evidence-first prospect intelligence, research, and outreach CRM for NebulaStack.**

Built according to the authoritative product and engineering blueprint (`NebulaScout_Advanced_Blueprint_2026-10.md`).

---

## Architecture Overview

- **Backend:** Laravel 13 (PHP 8.3+) in `backend/` with SQLite default local database, Sanctum, CORS, deterministic scoring, SSRF-safe bounded crawler, and Gemini AI synthesis.
- **Frontend:** Next.js 16 (React 19, TypeScript) in `frontend/` using App Router, Turbopack, and Tailwind CSS with an editorial obsidian palette.
- **Design Principles:** Evidence before inference, deterministic qualification rubrics, zero autonomous outreach sending, and explicit human confirmation with immutable sent-message history.

---

## Quick Start & Local Setup

### Prerequisites
- **PHP:** 8.3+ with `pdo_sqlite`, `curl`, `mbstring`, `openssl`, `xml`, `zip`
- **Composer:** 2.x
- **Node.js:** v20.x or higher
- **npm:** 10.x or higher

### 1. Backend Setup
```bash
cd backend

# Install dependencies (if not already installed)
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Run database migrations and seed playbooks & demo data
php artisan migrate --seed

# Start the Laravel backend server
php artisan serve --host=127.0.0.1 --port=8000
```
Backend API will be running at `http://127.0.0.1:8000/api/v1`.

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Next.js development server
npm run dev
```
Frontend web application will be running at `http://localhost:3000`.

---

## Automated Tests & Verification

### Run Backend Feature & SSRF Tests
```bash
cd backend
php artisan test
```
*Executes all 11 unit and feature tests covering prospect deduplication, SSRF protection against loopback/metadata IPs, copy draft immutability, and manual send confirmation.*

### Run Frontend Production Build & Typecheck
```bash
cd frontend
npm run build
```
*Compiles all Next.js 16 App Router pages and verifies TypeScript types with Turbopack.*

---

## Key Features & User Workflows

1. **Overview Dashboard (`/`):** Real-time KPI metrics, conversion rates, follow-ups due, recent activity stream, and AI token/cost accounting.
2. **Discover Candidates (`/discover`):** Launch research by selecting from 7 category playbooks (Architecture, Photography, Interior Design, Clinics, Hospitality, Event Planning, Custom) or enter any direct website URL.
3. **Prospects Directory (`/prospects`):** Searchable and filterable candidate directory with Fit, Opportunity, and Confidence score badges, stale research flags, and CSV import/export.
4. **Prospect Dossier & Outreach Workspace:**
   - Full evidence provenance with source quotes and hashes
   - Safe website audit breakdown (speed, HTTPS, viewport, enquiry paths, image alt coverage)
   - Channel-specific AI drafts (Instagram DM, email, website form)
   - One-click **Copy Message** with visual confirmation (does *not* mark sent)
   - One-click **Open Profile** to view live public social/web channels
   - **Confirm Sent Externally** modal that permanently records the exact sent text and schedules next follow-up
5. **Outreach & Follow-Up Reminders (`/outreach`):** Grouped by Overdue, Due Today, and Upcoming with one-click completion.
6. **Pipeline Kanban Board (`/pipeline`):** Visual lead progression from Discovered to Won deals.
7. **Playbook Editor (`/playbooks`):** Data-driven ICP definitions, scoring weights, and JSON export/import.
8. **Settings & Diagnostics (`/settings`):** Live status of Gemini AI, search providers, and SSRF crawler policy.

---

## API Configuration (Optional)

NebulaScout is fully functional out-of-the-box with deterministic editorial synthesis and direct URL crawling. To connect live external APIs, edit `backend/.env`:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Optional Search Discovery Providers
BRAVE_SEARCH_API_KEY=your_brave_search_key
SERPER_API_KEY=your_serper_key
GOOGLE_PLACES_API_KEY=your_google_places_key
```

---

## Documentation
- [System Architecture](docs/ARCHITECTURE.md)
- [Provider Setup & Fallbacks](docs/PROVIDERS.md)
- [Security & SSRF Protections](docs/SECURITY.md)
- [Implementation Progress & Checklist](docs/IMPLEMENTATION_PLAN.md)
