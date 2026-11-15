# SaathiCare — Implementation Checklist

> Living tracker — updated as phases complete.
> Legend: `[ ]` = todo · `[x]` = done · `[~]` = in progress · `[!]` = blocked

---

## Phase 0 — Architecture & Planning

### Deliverables
- [x] `docs/architecture/ARCHITECTURE.md` — System architecture, monorepo, data flows
- [x] `docs/architecture/PERMISSION_MATRIX.md` — Full RBAC matrix, 19 resources
- [x] `docs/architecture/DATABASE_MODELS.md` — All Mongoose schemas
- [x] `docs/architecture/API_ROUTES.md` — All 50+ endpoints
- [x] `docs/architecture/RISK_REGISTER.md` — Security, privacy, reliability, ops risks
- [x] `docs/architecture/DOSE_LIFECYCLE.md` — State machine + escalation policy
- [x] `docs/architecture/IMPLEMENTATION_CHECKLIST.md` — This file

---

## Phase 1 — Project Bootstrap & Infrastructure

### Monorepo Setup
- [ ] Initialize pnpm workspace (`pnpm-workspace.yaml`)
- [ ] Create `turbo.json` with build/dev/test pipelines
- [ ] Create root `package.json` with workspaces
- [ ] Create `apps/web/` (Next.js 14 scaffold)
- [ ] Create `apps/api/` (Express 5 scaffold)
- [ ] Create `packages/shared-types/` package
- [ ] Create `packages/ui-tokens/` with brand color tokens
- [ ] Configure TypeScript strict mode (`tsconfig.base.json`)
- [ ] Configure ESLint + Prettier (root config)
- [ ] Configure Husky + lint-staged (pre-commit hooks)
- [ ] Configure `.env.example` files for both apps

### Environment Configuration
- [ ] `apps/api/src/config/env.ts` — Zod-validated env schema
  - [ ] `MONGODB_URI`
  - [ ] `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  - [ ] `JWT_PRIVATE_KEY` + `JWT_PUBLIC_KEY` (RS256)
  - [ ] `RESEND_API_KEY`
  - [ ] `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY`
  - [ ] `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` + `S3_BUCKET`
  - [ ] `CLIENT_ORIGIN`

### Database Connection
- [ ] `apps/api/src/config/db.ts` — Mongoose connection with retry
- [ ] `apps/api/src/config/redis.ts` — Upstash Redis (ioredis) connection

### CI/CD
- [ ] `.github/workflows/ci.yml` — TypeScript check + lint + test on PR
- [ ] `.github/workflows/deploy-api.yml` — Deploy to Render/Railway on merge to main
- [ ] `.github/workflows/deploy-web.yml` — Vercel deploy (auto via Vercel GitHub integration)

---

## Phase 2 — Data Models

### Models to implement (`apps/api/src/models/`)
- [ ] `User.ts`
- [ ] `CareProfile.ts`
- [ ] `CareCircleMembership.ts`
- [ ] `Invitation.ts`
- [ ] `ConsentRecord.ts`
- [ ] `Medication.ts`
- [ ] `MedicationSchedule.ts`
- [ ] `DoseOccurrence.ts`
- [ ] `DoseEvent.ts`
- [ ] `Appointment.ts`
- [ ] `Routine.ts`
- [ ] `RoutineCompletion.ts`
- [ ] `HealthObservation.ts`
- [ ] `EmergencyContact.ts`
- [ ] `MedicalDocument.ts`
- [ ] `NotificationPreference.ts`
- [ ] `Notification.ts`
- [ ] `DeliveryAttempt.ts`
- [ ] `AuditLog.ts`
- [ ] `RefreshToken.ts`
- [ ] `PushSubscription.ts`
- [ ] `WeeklyDigest.ts`

### Indexes
- [ ] Verify all compound indexes created on `app.listen()`
- [ ] TTL index on `AuditLog` (90 days)
- [ ] TTL index on `RefreshToken` (7 days)
- [ ] TTL index on `Notification` (30 days)
- [ ] Partial unique index on `DoseEvent` (terminal types per occurrence)

---

## Phase 3 — Authentication System

### Backend
- [ ] `POST /api/auth/register` — Email + password registration
- [ ] `POST /api/auth/login` — Login with rate limiting
- [ ] `POST /api/auth/refresh` — Refresh token rotation
- [ ] `POST /api/auth/logout` — Revoke refresh token
- [ ] `POST /api/auth/forgot-password` — Send reset email (Resend)
- [ ] `POST /api/auth/reset-password/:token` — Set new password
- [ ] `GET /api/auth/me` — Get current user
- [ ] `middleware/authenticate.ts` — JWT RS256 verification
- [ ] Rate limiter on auth endpoints (Upstash)
- [ ] `bcrypt` password hashing (cost=12)
- [ ] Refresh token storage in MongoDB (`RefreshToken` model)
- [ ] Token reuse detection (revoke family on replay)
- [ ] `AuditLog` entries for login, logout, password reset

### Frontend (`apps/web/`)
- [ ] `app/(auth)/login/page.tsx`
- [ ] `app/(auth)/register/page.tsx`
- [ ] `app/(auth)/forgot-password/page.tsx`
- [ ] Auth context / provider with token refresh logic
- [ ] `lib/api-client.ts` with interceptor for 401 → refresh → retry
- [ ] Protected route middleware (`middleware.ts`)

---

## Phase 4 — Care Profile & Care Circle

### Backend
- [ ] `POST /api/care-profiles` — Create care profile
- [ ] `GET /api/care-profiles/:id` — Get care profile
- [ ] `PATCH /api/care-profiles/:id` — Update care profile
- [ ] `DELETE /api/care-profiles/:id` — Delete care profile
- [ ] `GET /api/care-profiles/:id/members` — List circle members
- [ ] `PATCH /api/care-profiles/:id/members/:userId` — Update member permissions
- [ ] `DELETE /api/care-profiles/:id/members/:userId` — Revoke / self-leave
- [ ] `POST /api/care-profiles/:id/invite` — Send invitation email
- [ ] `GET /api/care-profiles/:id/invitations` — List pending invitations
- [ ] `DELETE /api/care-profiles/:id/invitations/:invitationId` — Revoke invitation
- [ ] `POST /api/invitations/:token/accept` — Accept invitation (public)
- [ ] `POST /api/invitations/:token/decline` — Decline invitation (public)
- [ ] `middleware/authorize.ts` — CareCircleMembership check + RBAC
- [ ] Proposed-edit workflow for family mutations
- [ ] AuditLog entries for all mutations

### Frontend
- [ ] `app/(dashboard)/care-circle/page.tsx` — Members list
- [ ] Invite modal with email input + role selection
- [ ] Member permissions panel (owner only)
- [ ] Accept invitation page `app/accept-invite/[token]/page.tsx`

---

## Phase 5 — Medications & Schedules

### Backend
- [ ] `POST /api/care-profiles/:id/medications` — Create medication
- [ ] `GET /api/care-profiles/:id/medications` — List medications
- [ ] `GET /api/care-profiles/:id/medications/:medId` — Get medication
- [ ] `PATCH /api/care-profiles/:id/medications/:medId` — Update medication
- [ ] `DELETE /api/care-profiles/:id/medications/:medId` — Soft delete
- [ ] `POST /api/care-profiles/:id/medications/:medId/schedules` — Add schedule
- [ ] `GET /api/care-profiles/:id/medications/:medId/schedules` — List schedules
- [ ] `PATCH /api/care-profiles/:id/medications/:medId/schedules/:schedId` — Update schedule
- [ ] `DELETE /api/care-profiles/:id/medications/:medId/schedules/:schedId` — Delete schedule

### DoseOccurrence Seeder
- [ ] `services/scheduler.service.ts` — Seeds DoseOccurrences for next N days on schedule create/update
- [ ] Nightly BullMQ job to extend occurrence horizon (+7 days)
- [ ] Timezone-aware scheduling (Luxon)
- [ ] DST-safe recurrence computation

### Frontend
- [ ] `app/(dashboard)/medications/page.tsx` — Medication list
- [ ] `app/(dashboard)/medications/new/page.tsx` — Add medication form
- [ ] `app/(dashboard)/medications/[id]/page.tsx` — Medication detail + schedule

---

## Phase 6 — Dose Management

### Backend
- [ ] `GET /api/care-profiles/:id/doses` — List doses (date range filter)
- [ ] `GET /api/care-profiles/:id/doses/:occurrenceId` — Get dose occurrence
- [ ] `POST /api/care-profiles/:id/doses/:occurrenceId/confirm` — Confirm dose
- [ ] `POST /api/care-profiles/:id/doses/:occurrenceId/skip` — Skip dose
- [ ] `POST /api/care-profiles/:id/doses/:occurrenceId/snooze` — Snooze dose
- [ ] `POST /api/care-profiles/:id/doses/:occurrenceId/caregiver-ack` — Caregiver ack
- [ ] `GET /api/care-profiles/:id/doses/:occurrenceId/events` — Dose event history

### BullMQ Jobs
- [ ] `jobs/doseReminder.job.ts` — Enqueued at T-15min; sets state=DUE; sends push/email
- [ ] `jobs/missedDose.job.ts` — Enqueued at T+graceMin; sets state=OVERDUE; notifies care circle
- [ ] `jobs/escalationClose.job.ts` — Enqueued at T+escalationMin; sets state=MISSED
- [ ] Idempotency key on all dose jobs
- [ ] Stale job detection (skip if >60min past scheduled time)

### Frontend
- [ ] `components/dose/DoseCard.tsx` — Today's doses widget
- [ ] `components/dose/DoseConfirmModal.tsx` — Confirm / skip / snooze UI
- [ ] `components/dose/DoseTimeline.tsx` — History view
- [ ] Dashboard: "Today's Medications" section

---

## Phase 7 — Appointments & Routines

### Backend
- [ ] `POST /api/care-profiles/:id/appointments`
- [ ] `GET /api/care-profiles/:id/appointments`
- [ ] `GET /api/care-profiles/:id/appointments/:appId`
- [ ] `PATCH /api/care-profiles/:id/appointments/:appId`
- [ ] `DELETE /api/care-profiles/:id/appointments/:appId`
- [ ] `POST /api/care-profiles/:id/routines`
- [ ] `GET /api/care-profiles/:id/routines`
- [ ] `GET /api/care-profiles/:id/routines/:routineId`
- [ ] `PATCH /api/care-profiles/:id/routines/:routineId`
- [ ] `DELETE /api/care-profiles/:id/routines/:routineId`
- [ ] `POST /api/care-profiles/:id/routines/:routineId/complete`
- [ ] Appointment reminder BullMQ job (T-24h, T-1h)

### Frontend
- [ ] `app/(dashboard)/appointments/page.tsx`
- [ ] Appointment form + calendar widget
- [ ] Routines checklist component on dashboard

---

## Phase 8 — Health Observations

### Backend
- [ ] `POST /api/care-profiles/:id/health`
- [ ] `GET /api/care-profiles/:id/health`
- [ ] `GET /api/care-profiles/:id/health/:obsId`
- [ ] `PATCH /api/care-profiles/:id/health/:obsId`
- [ ] `DELETE /api/care-profiles/:id/health/:obsId`

### Frontend
- [ ] `app/(dashboard)/health/page.tsx`
- [ ] Observation type selector (blood pressure, glucose, weight, mood, etc.)
- [ ] Trend chart (Recharts)

---

## Phase 9 — Documents, Emergency Contacts

### Backend
- [ ] `POST /api/care-profiles/:id/documents/upload-url` — Presigned URL
- [ ] `POST /api/care-profiles/:id/documents` — Confirm upload + save metadata
- [ ] `GET /api/care-profiles/:id/documents`
- [ ] `GET /api/care-profiles/:id/documents/:docId/download-url`
- [ ] `DELETE /api/care-profiles/:id/documents/:docId`
- [ ] `POST /api/care-profiles/:id/emergency-contacts`
- [ ] `GET /api/care-profiles/:id/emergency-contacts`
- [ ] `PATCH /api/care-profiles/:id/emergency-contacts/:contactId`
- [ ] `DELETE /api/care-profiles/:id/emergency-contacts/:contactId`

### Frontend
- [ ] `app/(dashboard)/documents/page.tsx`
- [ ] File upload component (drag-and-drop)
- [ ] Emergency contacts section in settings

---

## Phase 10 — Notifications System

### Backend
- [ ] `GET /api/notifications` — Paginated notification inbox (authenticated user)
- [ ] `PATCH /api/notifications/:id/read` — Mark as read
- [ ] `PATCH /api/notifications/read-all` — Mark all as read
- [ ] `GET /api/notifications/preferences` — Get preferences
- [ ] `PATCH /api/notifications/preferences` — Update preferences
- [ ] `POST /api/push/subscribe` — Register push subscription (VAPID)
- [ ] `DELETE /api/push/subscribe` — Unregister push
- [ ] `services/push.service.ts` — web-push dispatch
- [ ] `services/email.service.ts` — Resend templates
- [ ] `services/notification.service.ts` — Orchestrator
- [ ] `jobs/weeklyDigest.job.ts` — Sunday evening summary email
- [ ] DeliveryAttempt tracking + retry (max 3)

### Frontend
- [ ] Notification bell in nav header
- [ ] Notification inbox drawer
- [ ] Notification preferences page (push on/off, email on/off per event type)
- [ ] PWA manifest + service worker (`public/manifest.json`, `app/sw.ts`)
- [ ] `hooks/usePushSubscription.ts` — VAPID subscription logic

---

## Phase 11 — Audit Log & Export

### Backend
- [ ] `GET /api/care-profiles/:id/audit-logs` — Paginated audit log (owner only)
- [ ] `GET /api/care-profiles/:id/export` — Full data export (JSON)
- [ ] `services/audit.service.ts` — Write AuditLog entries

### Frontend
- [ ] Audit log table in settings (owner only)
- [ ] Export data button

---

## Phase 12 — Polish, Testing & Deploy

### Testing
- [ ] Unit tests for `dose.service.ts` (state transitions)
- [ ] Unit tests for `notification.service.ts`
- [ ] Unit tests for `authorize.ts` middleware (all permission cases)
- [ ] Integration tests for auth endpoints
- [ ] Integration tests for dose confirm/skip/snooze/ack endpoints
- [ ] Integration tests for care circle invite/accept flow

### Security Hardening
- [ ] `express-mongo-sanitize` middleware
- [ ] `helmet.js` with CSP headers
- [ ] CORS configured to `CLIENT_ORIGIN` only
- [ ] `express-rate-limit` + Upstash rate limiter on all routes
- [ ] Zod `strict()` on all request body schemas

### Performance
- [ ] All DB queries use projected fields (no `.lean()` omissions)
- [ ] Pagination on all list endpoints (cursor or page-based)
- [ ] Redis caching for `CareCircleMembership` lookups (TTL 60s)

### Production Deploy
- [ ] Render/Railway API service configured
- [ ] Vercel frontend project connected to GitHub
- [ ] MongoDB Atlas production cluster (separate from dev)
- [ ] Upstash Redis production database
- [ ] All secrets in Render/Vercel environment variables
- [ ] Health check endpoint `GET /health` returning 200

### Hackathon Demo
- [ ] Seed script with realistic demo data
- [ ] Demo user credentials documented
- [ ] README with setup instructions
- [ ] Architecture diagram in README (link to ARCHITECTURE.md)
- [ ] Loom demo video
