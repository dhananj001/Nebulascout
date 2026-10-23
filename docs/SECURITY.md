# NebulaScout — Security, Privacy & Egress Controls

This document details the security and privacy mechanisms implemented across the NebulaScout application.

---

## 1. Server-Side Request Forgery (SSRF) Protection

Website crawling is security-sensitive. NebulaScout's `WebsiteAuditService` enforces strict pre-connection and post-redirect validations:

### Prohibited Destinations
- **Loopback:** `127.0.0.0/8`, `::1`
- **Private Subnets:** `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- **Link-Local & Cloud Metadata:** `169.254.0.0/16`, `169.254.169.254`, `metadata.google.internal`, `instance-data`
- **Reserved Subnets:** Broadcast, multicast (`224.0.0.0/4`), IPv6 unique local (`fc00::/7`), IPv6 link-local (`fe80::/10`)
- **Internal Domain Names:** Any hostname ending in `.internal`, `.local`, or matching `localhost`

### DNS Resolution & Re-Validation
- Resolves DNS A and AAAA records prior to initiating connection.
- Validates every returned IP against restricted CIDR blocks.
- Redirects are not followed blindly; redirect destination URLs are independently re-parsed, resolved, and validated.

### Bounded Resource Ceilings
- **Timeout:** 8 seconds maximum per request.
- **Payload Cap:** Responses are bounded to 2MB (2,097,152 bytes).
- **Non-Executable HTML Parsing:** Extracted HTML is parsed exclusively via PHP's `DOMDocument` with `LIBXML_NONET` to prevent XML external entity (XXE) attacks. JavaScript is never executed.

---

## 2. Prompt-Injection Defense

All content fetched from external websites, social profiles, imported CSV files, and user notes is treated as untrusted input:
- System instructions explicitly direct the LLM that text inside `<untrusted_evidence_data>` tags represents passive data, never instructions.
- Models are restricted to producing structured JSON adhering to strict schemas.
- Models have no access to arbitrary tool execution, shell commands, or database writes.

---

## 3. Secret Management

- API keys (`GEMINI_API_KEY`, `BRAVE_SEARCH_API_KEY`, etc.) are read exclusively server-side via environment variables.
- No API keys are bundled into client-side Next.js code or exposed in frontend responses.
- The `/api/v1/providers` status endpoint returns boolean indicators (`has_api_key: true/false`), never revealing key values.

---

## 4. Privacy & Anti-Spam Compliance

- **Human-in-the-Loop:** NebulaScout does not execute autonomous email or Instagram DM campaigns. All sending requires operator action.
- **Immutable Audit Trail:** When an operator marks a message as sent, the exact message text, timestamp, and channel are recorded permanently in `sent_messages`.
- **Do-Not-Contact Enforcement:** Marking a prospect as "Do Not Contact" immediately disables routine drafting and follow-up alerts for that prospect.
- **Public Business Data Only:** NebulaScout only collects publicly published business contact details (e.g., studio inquiry emails, public office numbers).
