# SaathiCare — Risk Register

> Last updated: Phase 0 (pre-implementation)
> Likelihood: **H** = High · **M** = Medium · **L** = Low
> Impact: **H** = High · **M** = Medium · **L** = Low

---

## 1. Security Risks

| Risk ID | Description | Likelihood | Impact | Mitigation |
|---------|-------------|-----------|--------|------------|
| **SEC-01** | **IDOR — Insecure Direct Object Reference**: Attacker accesses another user's care profile resources by guessing/enumerating IDs | M | H | Every API handler calls `authorize()` middleware which validates that the authenticated user is a **CareCircleMembership** member of the target `careProfileId`. ObjectId (non-sequential) reduces enumeration risk. |
| **SEC-02** | **Session Fixation / Token Theft**: Attacker steals a JWT access token from localStorage or network | M | H | Access tokens stored only in memory (not localStorage). Refresh tokens stored in `httpOnly; Secure; SameSite=Strict` cookie. Tokens signed with RS256 (asymmetric). |
| **SEC-03** | **Refresh Token Replay Attack**: Stolen refresh token reused after legitimate rotation | M | H | Refresh token rotation: each use invalidates the old token and issues a new one. Family ID chain tracked; if old token is replayed after rotation, entire family is revoked (refresh token reuse detection). |
| **SEC-04** | **CSRF on State-Mutating Endpoints**: Cross-site request forging dose confirmations or profile edits | M | H | `SameSite=Strict` cookies mitigate most CSRF. Additionally, the API checks `Origin` / `Referer` headers and requires explicit `Content-Type: application/json` on mutation endpoints. |
| **SEC-05** | **XSS — Stored**: Attacker injects script via medication name, appointment notes, or health observations | L | H | All user-generated content sanitized with `DOMPurify` on render. Backend rejects HTML via Zod `.trim().max()` with no HTML passthrough. CSP headers set via Next.js `headers()`. |
| **SEC-06** | **NoSQL Injection**: Malformed query operators (`$where`, `$gt`) in request body | L | H | All inputs validated with Zod schemas before reaching Mongoose. Mongoose sanitizes query inputs by default. `express-mongo-sanitize` middleware strips `$`-prefixed keys. |
| **SEC-07** | **Brute Force on Login / OTP**: Automated credential stuffing or OTP guessing | H | H | Upstash Redis rate limiter: 5 failed attempts per IP per 15 min on `/auth/login`. OTP: 6-digit, 10-min TTL, max 3 attempts, then lockout 30 min. |
| **SEC-08** | **Invitation Token Abuse**: Invitation link forwarded and accepted by unintended recipient | M | M | Invitation tokens are single-use, expire in 48 hours, and are bound to the invited email. Accepting with a different email is rejected. Tokens are UUIDs (crypto.randomUUID). |
| **SEC-09** | **Privilege Escalation via Role Manipulation**: Attacker modifies JWT claims or membership role | L | H | JWT signed with RS256 private key (backend only). Role derived from `CareCircleMembership.role` in DB on every authorized request — never trusted from token payload. |
| **SEC-10** | **Insecure File Upload**: Attacker uploads malware disguised as a medical document | M | H | Backend issues S3 presigned URL for allowed MIME types only (PDF, JPEG, PNG). File type validated server-side before recording `MedicalDocument`. Max size enforced (10MB). Files served via pre-signed GET URLs (not public). |
| **SEC-11** | **Mass Assignment**: Attacker sends extra fields in PATCH body to elevate permissions | M | H | Zod `strict()` schemas strip unknown keys. Mongoose schema `strict: true` (default). Sensitive fields (`role`, `ownerId`) never patchable via public endpoints. |

---

## 2. Privacy Risks

| Risk ID | Description | Likelihood | Impact | Mitigation |
|---------|-------------|-----------|--------|------------|
| **PRV-01** | **Data Leakage in Push Notifications**: Medication names or PHI visible in OS notification drawer | M | M | Push payload contains only `{ type, profileId, occurrenceId }`. Rich details fetched by the app on tap via authenticated API call. Notification body shows generic text: "It's time for your medication." |
| **PRV-02** | **Email Content Interception**: Medication details in plaintext email | M | M | Emails contain only action links and minimal context. PHI (medication names, dosages) excluded from email body. Emails transmitted over TLS (Resend). |
| **PRV-03** | **Audit Log Leakage**: Audit logs contain `before`/`after` snapshots with PHI | L | M | AuditLog READ restricted to `profile_owner` only. Logs have 90-day TTL (auto-purge). Logs excluded from JSON export by family/caregiver roles. |
| **PRV-04** | **Over-permissioned Care Circle Members**: Family member sees more data than intended | M | H | `CareCircleMembership.permissions` bitfield controls per-resource access. `canViewMedications`, `canViewAppointments`, `canViewHealthData`, `canViewDocuments` flags enforced per endpoint. |
| **PRV-05** | **Data Export Privacy**: Bulk export includes another person's data | L | H | Export endpoint (`GET /care-profiles/:id/export`) restricted to `profile_owner`. Data scoped strictly to the requested `careProfileId` after membership check. |

---

## 3. Reliability Risks

| Risk ID | Description | Likelihood | Impact | Mitigation |
|---------|-------------|-----------|--------|------------|
| **REL-01** | **Duplicate Dose Events**: Race condition creates two DoseEvent documents for same occurrence | M | H | MongoDB unique compound index: `{ occurrenceId, type: "TAKEN" }` (partial index on terminal types). BullMQ job idempotency key prevents double-processing. API uses `findOneAndUpdate` with `upsert:false` + optimistic lock. |
| **REL-02** | **Timezone / DST Bug**: Dose scheduled at 08:00 local fires at wrong UTC time after DST change | M | H | Scheduled times stored as UTC instants. When DST transition detected (Luxon `DateTime.isInDST`), all future `DoseOccurrence` UTC times are recomputed. Recurring schedule seeder runs nightly and repairs upcoming occurrences. |
| **REL-03** | **Duplicate BullMQ Jobs**: Server restart re-enqueues already-queued jobs | M | M | Jobs keyed by `jobId = dose:{occurrenceId}:{jobType}`. BullMQ deduplication via `removeOnComplete: { count: 1000 }` and jobId uniqueness. Stale jobs pruned on startup. |
| **REL-04** | **Missed Job on Server Restart**: BullMQ job fires while server is down | M | H | BullMQ uses Redis for persistence — jobs survive restarts. Worker reconnects and processes queued jobs on restart. `stalledInterval` and `maxStalledCount` configured to re-attempt stalled jobs. |
| **REL-05** | **MongoDB Atlas Downtime**: Brief network partition causes API failures | L | H | Mongoose `serverSelectionTimeoutMS: 5000` with retry on initial connect. Health check endpoint (`/health`) used by Render for restart policy. Circuit breaker pattern on critical DB calls. |
| **REL-06** | **Scheduler Drift**: Reminder fires significantly late due to queue congestion | L | M | BullMQ jobs carry `scheduledTime` in payload; worker checks staleness before processing. If job is >60min past scheduled time, skip reminder and transition directly to OVERDUE. |
| **REL-07** | **Weekly Digest Double-send**: Digest sent twice on cron duplicate trigger | L | M | `WeeklyDigest` document created before sending with `status: "in_progress"`. Cron checks existence before creating. Idempotent: duplicate trigger finds existing doc and skips. |

---

## 4. Operational Risks

| Risk ID | Description | Likelihood | Impact | Mitigation |
|---------|-------------|-----------|--------|------------|
| **OPS-01** | **Missing API Keys at Deploy**: `RESEND_API_KEY`, `VAPID_PRIVATE_KEY`, `JWT_PRIVATE_KEY` not set | M | H | `config/env.ts` uses Zod `.parse(process.env)` at startup — server refuses to start with helpful error message listing missing keys. CI/CD pipeline validates env before deploy. |
| **OPS-02** | **Redis Unavailable (Upstash)**: Rate limiter, BullMQ, and session cache all fail | L | H | Rate limiter middleware fails open (logs warning, allows request) to prevent availability outage. BullMQ reconnects with exponential backoff. Session cache miss falls back to DB lookup. Alert on Redis connection errors. |
| **OPS-03** | **Email Provider Rate Limits (Resend)**: Burst of notifications exceeds free tier | M | M | Emails batched and sent via BullMQ queue with concurrency=2 and rate=10/sec. Weekly digest uses a single email per user (no per-dose emails). Upgrade path to paid Resend tier documented. |
| **OPS-04** | **S3/R2 Bucket Misconfiguration**: Medical documents publicly accessible | L | H | Bucket policy set to `private` (no public read). Pre-signed GET URLs expire in 15 minutes. CORS configured to allow only the app's origin. Bucket access logging enabled. |
| **OPS-05** | **MongoDB Index Missing**: Slow queries on large datasets | M | M | All critical indexes defined in Mongoose schemas and created on app startup. `autoIndex: true` in development; `autoIndex: false` + migration script in production. Query plan analysis documented. |
| **OPS-06** | **Secret Rotation Not Planned**: Long-lived secrets increase breach blast radius | M | M | JWT RS256 key pair rotatable independently (refresh tokens re-issued). Render/Railway secret management used for injection. Rotation runbook documented. |
| **OPS-07** | **PWA Service Worker Stale Cache**: User sees outdated UI after deploy | M | L | next-pwa configured with `networkFirst` strategy for API calls, `staleWhileRevalidate` for static assets. `SKIP_WAITING` in SW forces immediate activation. |
| **OPS-08** | **Hackathon Demo Data Bleed**: Demo seed data leaks into production | M | M | Seed scripts only run in `NODE_ENV=development`. Production DB is a separate Atlas cluster. Environment prefix on all env vars (`DEV_`, `PROD_`). |

---

## 5. Risk Heatmap

```
         IMPACT
              L          M          H
         ┌──────────┬──────────┬──────────┐
L   L    │ OPS-07   │ PRV-03   │ SEC-06   │
I        │          │ REL-06   │ SEC-09   │
K        │          │          │ OPS-04   │
E   ─────├──────────┼──────────┼──────────┤
L   M    │          │ PRV-01   │ SEC-01   │
I        │          │ PRV-02   │ SEC-02   │
H        │          │ OPS-03   │ SEC-04   │
O        │          │ OPS-05   │ SEC-10   │
O        │          │ REL-07   │ SEC-11   │
D        │          │          │ REL-01   │
     ─────├──────────┼──────────┼──────────┤
H   H    │          │ PRV-04   │ SEC-07   │
         │          │          │ SEC-08   │
         │          │          │ REL-02   │
         │          │          │ REL-03   │
         │          │          │ REL-04   │
         └──────────┴──────────┴──────────┘
                         ↑ PRIORITIZE THESE (H×H)
```
