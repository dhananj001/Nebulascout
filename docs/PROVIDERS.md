# NebulaScout — External Providers & Credential Setup

NebulaScout is designed to operate immediately even without external paid API keys. When third-party credentials are not configured, the application operates in resilient deterministic mode with truthful reporting—it never fabricates live API responses.

---

## 1. Google Gemini AI API

### Purpose
Used by the AI Layer for:
- Research synthesis into grounded observations
- Opportunity extraction with source citations
- Channel-tailored outreach drafts adhering to category tone and prohibited claims

### Configuration
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Add the following to `backend/.env`:
```env
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
```
3. Verify configuration: Visit `http://localhost:3000/settings` and verify Gemini status displays **"Connected"**.

### Behavior Without Key
When `GEMINI_API_KEY` is not present, `GeminiAiService` automatically activates the built-in deterministic editorial synthesis engine. This engine extracts observations directly from the website audit and provides high-quality structured outreach drafts without making external network calls.

---

## 2. Web Search & Business Discovery Providers

NebulaScout supports multiple search providers for automated category candidate discovery.

### Supported Providers
1. **Brave Search API:**
   - Env key: `BRAVE_SEARCH_API_KEY`
   - Setup: [Brave Search API Portal](https://brave.com/search/api/)
2. **Serper Search API:**
   - Env key: `SERPER_API_KEY`
   - Setup: [Serper.dev](https://serper.dev)
3. **Google Places API:**
   - Env key: `GOOGLE_PLACES_API_KEY`
   - Setup: [Google Cloud Console](https://console.cloud.google.com/)

### Direct URL & CSV Import (Zero-Credential Mode)
Even when no search API key is configured, discovery works out-of-the-box via:
- **Direct Candidate URL:** Enter any website URL on the Discover page. NebulaScout executes an SSRF-safe crawl, extracts evidence, audits viewport/images, and generates outreach drafts.
- **CSV Import:** Upload candidate spreadsheets with columns `business_name`, `website`, `instagram`, `location`, `phone`, `email`.

---

## 3. Social Media & Instagram Policy

NebulaScout strictly follows permitted data policies:
- Instagram profile links and handles are collected only through public business listings or direct manual entry.
- **No Automated DM Sending:** All outreach sending requires human review, copying to clipboard, external sending via Instagram/email, and explicit manual confirmation in NebulaScout.
- No session cookie harvesting, private profile scraping, or CAPTCHA bypass is implemented or permitted.
