# SaathiCare — RBAC Permission Matrix

> This matrix covers ALL resources in the SaathiCare platform.
> Authorization is **always resource-scoped**: a role check alone is insufficient.
> Every request must pass the **CareCircleMembership check** first (is the authenticated user a member of the target care profile?), then the role + permission flag check.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Allowed unconditionally (for this role) |
| 🔒 | Allowed only for own record (self) |
| 🏳️ | Allowed only if `CareCircleMembership.permissions.<flag>` is `true` |
| 🔑 | Allowed only if caregiver scope matches the resource |
| ❌ | Denied |
| 📋 | Action is logged to AuditLog regardless of outcome |
| 🔔 | Triggers a notification |

**Roles:**
- **OWNER** — `profile_owner` (the elderly person; owns their own CareProfile)
- **FAMILY** — `family_member` (trusted family, permissions controlled by OWNER)
- **CAREGIVER** — `caregiver` (professional caregiver, scope-limited)
- **NONE** — authenticated but not a member of this care profile

---

## Membership Check (Pre-condition for ALL operations below)

```
1. Extract userId from verified JWT
2. Query CareCircleMembership WHERE userId=userId AND careProfileId=:id AND status='active'
3. If not found → 403 Forbidden (even for OWNER — must be member of own profile)
4. Extract role, permissions, scope from membership document
5. Proceed to per-resource checks below
```

---

## Permission Matrix Tables

### Resource: User

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| READ (own) | ✅ | ❌ | ❌ | ❌ | Only self; no cross-user read |
| UPDATE (own) | ✅ 📋 | ❌ | ❌ | ❌ | name, avatar, timezone only |
| DELETE (own) | ✅ 📋 | ❌ | ❌ | ❌ | Cascades to all owned care profiles |

---

### Resource: CareProfile

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| CREATE | ✅ | ❌ | ❌ | ❌ | Owner creates their own profile |
| READ | ✅ | 🏳️ `canViewProfile` | 🔑 | ❌ | |
| UPDATE | ✅ 📋 | 🏳️ `canEditProfile` → proposed edit | ❌ | ❌ | Family edits create `ProposedEdit`; owner approves |
| DELETE | ✅ 📋 | ❌ | ❌ | ❌ | |
| EXPORT | ✅ | ❌ | ❌ | ❌ | 📋 Logged; full data export |

---

### Resource: Medication

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| CREATE | ✅ 📋 🔔 | 🏳️ `canManageMedications` 📋 | 🔑 `canManageMedications` 📋 | ❌ | |
| READ | ✅ | 🏳️ `canViewMedications` | 🔑 | ❌ | |
| UPDATE | ✅ 📋 🔔 | 🏳️ `canManageMedications` 📋 → proposed edit | 🔑 `canManageMedications` 📋 | ❌ | Family changes go through proposed-edit approval |
| DELETE | ✅ 📋 | ❌ | ❌ | ❌ | Soft-delete; cascades to future DoseOccurrences |

---

### Resource: MedicationSchedule

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| CREATE | ✅ 📋 | 🏳️ `canManageMedications` 📋 | 🔑 `canManageMedications` 📋 | ❌ | |
| READ | ✅ | 🏳️ `canViewMedications` | 🔑 | ❌ | |
| UPDATE | ✅ 📋 | 🏳️ `canManageMedications` 📋 | 🔑 `canManageMedications` 📋 | ❌ | Re-seeds DoseOccurrences |
| DELETE | ✅ 📋 | ❌ | ❌ | ❌ | |

---

### Resource: DoseOccurrence

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| READ | ✅ | 🏳️ `canViewMedications` | 🔑 | ❌ | List + single |
| CONFIRM_DOSE | ✅ 📋 🔔 | 🏳️ `canConfirmDoses` 📋 🔔 | 🔑 `canConfirmDoses` 📋 🔔 | ❌ | Authorized proxy workflow |
| SKIP_DOSE | ✅ 📋 🔔 | 🏳️ `canConfirmDoses` 📋 | 🔑 `canConfirmDoses` 📋 | ❌ | Requires reason |
| SNOOZE_DOSE | ✅ 📋 | ❌ | ❌ | ❌ | Only owner can snooze |
| CAREGIVER_ACK | ❌ | ❌ | 🔑 📋 🔔 | ❌ | Caregiver acknowledges missed dose |

---

### Resource: DoseEvent

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| CREATE | (via CONFIRM/SKIP/ACK) | — | — | ❌ | Never created directly; created by dose actions |
| READ | ✅ | 🏳️ `canViewMedications` | 🔑 | ❌ | Dose history |
| UPDATE | ❌ | ❌ | ❌ | ❌ | Immutable once created |
| DELETE | ❌ | ❌ | ❌ | ❌ | Immutable |

---

### Resource: Appointment

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| CREATE | ✅ 📋 | 🏳️ `canManageAppointments` 📋 | 🔑 `canManageAppointments` 📋 | ❌ | |
| READ | ✅ | 🏳️ `canViewAppointments` | 🔑 | ❌ | |
| UPDATE | ✅ 📋 | 🏳️ `canManageAppointments` 📋 | 🔑 `canManageAppointments` 📋 | ❌ | |
| DELETE | ✅ 📋 | 🏳️ `canManageAppointments` 📋 | ❌ | ❌ | |

---

### Resource: Routine

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| CREATE | ✅ 📋 | 🏳️ `canManageRoutines` 📋 | 🔑 `canManageRoutines` 📋 | ❌ | |
| READ | ✅ | 🏳️ `canViewRoutines` | 🔑 | ❌ | |
| UPDATE | ✅ 📋 | 🏳️ `canManageRoutines` 📋 | 🔑 `canManageRoutines` 📋 | ❌ | |
| DELETE | ✅ 📋 | ❌ | ❌ | ❌ | |
| COMPLETE | ✅ 📋 | 🏳️ `canConfirmRoutines` 📋 | 🔑 `canConfirmRoutines` 📋 | ❌ | Creates RoutineCompletion |

---

### Resource: RoutineCompletion

| Operation | OWNER | FAMILY | CAREGIVER | NONE |
|-----------|-------|--------|-----------|------|
| READ | ✅ | 🏳️ `canViewRoutines` | 🔑 | ❌ |
| CREATE | (via COMPLETE action) | — | — | ❌ |
| DELETE | ❌ | ❌ | ❌ | ❌ |

---

### Resource: HealthObservation

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| CREATE | ✅ 📋 | 🏳️ `canManageHealth` 📋 | 🔑 `canManageHealth` 📋 | ❌ | |
| READ | ✅ | 🏳️ `canViewHealthData` | 🔑 | ❌ | |
| UPDATE | ✅ 📋 | 🏳️ `canManageHealth` 📋 | 🔑 `canManageHealth` 📋 | ❌ | |
| DELETE | ✅ 📋 | ❌ | ❌ | ❌ | |

---

### Resource: EmergencyContact

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| CREATE | ✅ 📋 | 🏳️ `canManageEmergencyContacts` 📋 | ❌ | ❌ | |
| READ | ✅ | 🏳️ `canViewEmergencyContacts` | 🔑 | ❌ | |
| UPDATE | ✅ 📋 | 🏳️ `canManageEmergencyContacts` 📋 | ❌ | ❌ | |
| DELETE | ✅ 📋 | ❌ | ❌ | ❌ | |

---

### Resource: MedicalDocument

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| CREATE (upload) | ✅ 📋 | 🏳️ `canUploadDocuments` 📋 | 🔑 `canUploadDocuments` 📋 | ❌ | Presigned URL issued; metadata saved after confirm |
| READ (list + presigned URL) | ✅ | 🏳️ `canViewDocuments` | 🔑 `canViewDocuments` | ❌ | Presigned URLs expire 15 min |
| UPDATE (metadata) | ✅ 📋 | ❌ | ❌ | ❌ | |
| DELETE | ✅ 📋 | ❌ | ❌ | ❌ | Also deletes from S3/R2 |

---

### Resource: NotificationPreference

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| READ (own) | ✅ | 🔒 own pref only | 🔒 own pref only | ❌ | Each member has their own pref |
| UPDATE (own) | ✅ 📋 | 🔒 | 🔒 | ❌ | |
| READ (all profile prefs) | ✅ | ❌ | ❌ | ❌ | Owner can see all prefs for their profile |

---

### Resource: AuditLog

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| READ | ✅ | ❌ | ❌ | ❌ | PHI-containing; owner-only |
| CREATE | System only | — | — | — | Never via API directly |
| DELETE | ❌ | ❌ | ❌ | ❌ | Immutable; TTL auto-deletes |

---

### Resource: CareCircleMembership

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| READ (list) | ✅ | 🔒 own membership | 🔒 own membership | ❌ | |
| UPDATE (permissions) | ✅ 📋 | ❌ | ❌ | ❌ | Only owner can change another's permissions |
| REVOKE | ✅ 📋 🔔 | 🔒 (self-leave) 📋 | 🔒 (self-leave) 📋 | ❌ | Owner can revoke others; others can self-leave |

---

### Resource: Invitation

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| INVITE (create) | ✅ 📋 🔔 | ❌ | ❌ | ❌ | Only owner can invite new members |
| READ (pending) | ✅ | ❌ | ❌ | ❌ | |
| REVOKE | ✅ 📋 | ❌ | ❌ | ❌ | Cancel before acceptance |
| ACCEPT | — | Invitee via token | Invitee via token | Invitee via token | Token-based; no membership required |
| DECLINE | — | Invitee via token | Invitee via token | Invitee via token | |

---

### Resource: ConsentRecord

| Operation | OWNER | FAMILY | CAREGIVER | NONE |
|-----------|-------|--------|-----------|------|
| READ | ✅ | ❌ | ❌ | ❌ |
| CREATE | System on join | — | — | — |
| UPDATE | ❌ | ❌ | ❌ | ❌ |

---

### Resource: Notification (inbox)

| Operation | OWNER | FAMILY | CAREGIVER | NONE | Notes |
|-----------|-------|--------|-----------|------|-------|
| READ (own) | ✅ | 🔒 own only | 🔒 own only | ❌ | |
| MARK_READ | ✅ | 🔒 | 🔒 | ❌ | |
| DELETE | 🔒 own | 🔒 own | 🔒 own | ❌ | |

---

### Resource: PushSubscription

| Operation | OWNER | FAMILY | CAREGIVER | NONE |
|-----------|-------|--------|-----------|------|
| CREATE (register) | 🔒 | 🔒 | 🔒 | ❌ |
| DELETE (unregister) | 🔒 | 🔒 | 🔒 | ❌ |

---

### Resource: RefreshToken

| Operation | OWNER | FAMILY | CAREGIVER | NONE |
|-----------|-------|--------|-----------|------|
| CREATE (login/refresh) | 🔒 | 🔒 | 🔒 | ❌ |
| DELETE (logout) | 🔒 📋 | 🔒 📋 | 🔒 📋 | ❌ |

---

## Special Cases & Workflows

### Proposed Edit Workflow (Family Member)

When a `family_member` with `canEditProfile=true` or `canManageMedications=true` submits a mutation:

1. The mutation is **NOT applied directly**.
2. A `ProposedEdit` document is created (embedded in the target resource or separate collection).
3. The `profile_owner` receives a notification: "Family member proposed a change to your medication schedule."
4. Owner can APPROVE (applies mutation + AuditLog) or REJECT (ProposedEdit discarded + AuditLog).
5. Caregiver mutations are applied directly (not proposed) to allow real-time care delivery.

### Authorized Proxy (Caregiver Confirming Doses)

A `caregiver` with `canConfirmDoses=true` in their `CareCircleMembership` may call `CONFIRM_DOSE` or `SKIP_DOSE` on behalf of the elderly person. The `DoseEvent.actor` is set to the caregiver's userId, and `DoseEvent.isProxy=true`. This is 📋 AuditLogged with `proxyActorId`.

### Audit-Logged Mutations

Every `CREATE`, `UPDATE`, `DELETE`, `CONFIRM_DOSE`, `SKIP_DOSE`, `REVOKE`, `INVITE` action writes an `AuditLog` entry with:
- `actor` (userId)
- `actorRole`
- `action`
- `resource` + `resourceId`
- `before` (previous doc snapshot, stripped of PII fields like passwords)
- `after` (new doc snapshot)
- `ip`, `userAgent`
- `timestamp`
