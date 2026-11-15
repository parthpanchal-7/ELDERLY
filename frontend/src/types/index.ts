// =============================================================================
// SaathiCare — TypeScript Interfaces
// Matches all Mongoose models defined in backend/src/models/
// =============================================================================

// ---------------------------------------------------------------------------
// Shared / utility types
// ---------------------------------------------------------------------------

export type ObjectId = string;

export type UserRole = 'profile_owner' | 'family_member' | 'caregiver';

export type DoseStatus = 'scheduled' | 'due' | 'taken' | 'skipped' | 'missed' | 'snoozed' | 'unconfirmed';

export type NotificationChannel = 'push' | 'sms' | 'email' | 'in_app';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export type DeliveryStatus = 'queued' | 'sent' | 'delivered' | 'failed';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed';

export type RoutineFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

export type ObservationType = 'blood_pressure' | 'blood_sugar' | 'weight' | 'temperature' | 'heart_rate' | 'oxygen_saturation' | 'mood' | 'pain_level' | 'custom';

export type DocumentType = 'prescription' | 'lab_report' | 'discharge_summary' | 'imaging' | 'insurance' | 'other';

export type AuditAction =
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'CONFIRM_DOSE' | 'SKIP_DOSE' | 'SNOOZE_DOSE' | 'CONFIRM_DOSE_PROXY'
  | 'INVITE_SENT' | 'INVITE_ACCEPTED' | 'INVITE_REVOKED'
  | 'CONSENT_GIVEN' | 'CONSENT_REVOKED'
  | 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH'
  | 'EXPORT';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';

export type FrequencyUnit = 'daily' | 'weekly' | 'monthly' | 'as_needed';

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface User {
  _id: ObjectId;
  email: string;
  passwordHash?: string;
  googleId?: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  primaryRole: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  preferredLanguage: 'en' | 'hi';
  timezone: string;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  lastLoginAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type AuthUser = Omit<User, 'passwordHash'>;

// ---------------------------------------------------------------------------
// CareProfile
// ---------------------------------------------------------------------------

export interface EmergencyContactEmbedded {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface CareProfile {
  _id: ObjectId;
  owner: ObjectId | User;
  fullName: string;
  dateOfBirth: Date | string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  primaryPhysician?: string;
  primaryPhysicianPhone?: string;
  primaryPhysicianEmail?: string;
  emergencyContacts: EmergencyContactEmbedded[];
  avatarUrl?: string;
  bio?: string;
  passcodePinHash?: string;
  hasCompletedOnboarding: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// CareCircleMembership
// ---------------------------------------------------------------------------

export interface CareCirclePermissions {
  canViewMedications: boolean;
  canViewAppointments: boolean;
  canViewRoutines: boolean;
  canViewHealthObservations: boolean;
  canViewDocuments: boolean;
  canConfirmDoseProxy: boolean;
  canEditMedications: boolean;
  canEditAppointments: boolean;
  canEditRoutines: boolean;
  canReceiveAlerts: boolean;
}

export interface CareCircleMembership {
  _id: ObjectId;
  careProfile: ObjectId | CareProfile;
  member: ObjectId | User;
  role: 'family_member' | 'caregiver';
  permissions: CareCirclePermissions;
  nickname?: string;
  relationship?: string;
  isActive: boolean;
  invitedBy: ObjectId | User;
  joinedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// Invitation
// ---------------------------------------------------------------------------

export interface Invitation {
  _id: ObjectId;
  careProfile: ObjectId | CareProfile;
  invitedBy: ObjectId | User;
  inviteeEmail: string;
  inviteePhone?: string;
  role: 'family_member' | 'caregiver';
  permissions: CareCirclePermissions;
  token: string;
  status: InvitationStatus;
  expiresAt: Date | string;
  acceptedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// ConsentRecord
// ---------------------------------------------------------------------------

export interface ConsentRecord {
  _id: ObjectId;
  careProfile: ObjectId | CareProfile;
  grantedBy: ObjectId | User;
  consentVersion: string;
  consentText: string;
  ipAddress?: string;
  userAgent?: string;
  grantedAt: Date | string;
  revokedAt?: Date | string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// Medication
// ---------------------------------------------------------------------------

export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface DoseOccurrenceTemplate {
  time: string; // HH:MM
  daysOfWeek?: DayOfWeek[];
  instructions?: string;
}

export interface Medication {
  _id: ObjectId;
  careProfile: ObjectId | CareProfile;
  createdBy: ObjectId | User;
  name: string;
  genericName?: string;
  dosage: string;
  unit: string;
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'patch' | 'inhaler' | 'drops' | 'other';
  frequency: FrequencyUnit;
  occurrences: DoseOccurrenceTemplate[];
  startDate: Date | string;
  endDate?: Date | string;
  instructions?: string;
  sideEffectsNotes?: string;
  prescribedBy?: string;
  rxNumber?: string;
  pharmacyName?: string;
  refillDate?: Date | string;
  pillCount?: number;
  isActive: boolean;
  requiresProxy: boolean;
  imageUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// DoseOccurrence
// ---------------------------------------------------------------------------

export interface DoseOccurrence {
  _id: ObjectId;
  medication: ObjectId | Medication;
  careProfile: ObjectId | CareProfile;
  scheduledAt: Date | string;
  dueAt: Date | string;
  graceEndAt: Date | string;
  status: DoseStatus;
  doseEvent?: ObjectId | DoseEvent;
  notificationSentAt?: Date | string;
  escalationSentAt?: Date | string;
  missedMarkedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// DoseEvent
// ---------------------------------------------------------------------------

export interface DoseEvent {
  _id: ObjectId;
  doseOccurrence: ObjectId | DoseOccurrence;
  medication: ObjectId | Medication;
  careProfile: ObjectId | CareProfile;
  reportedBy: ObjectId | User;
  action: 'taken' | 'skipped' | 'snoozed';
  reportedAt: Date | string;
  scheduledAt: Date | string;
  isProxy: boolean;
  snoozeUntil?: Date | string;
  skipReason?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// Appointment
// ---------------------------------------------------------------------------

export interface Appointment {
  _id: ObjectId;
  careProfile: ObjectId | CareProfile;
  createdBy: ObjectId | User;
  title: string;
  doctorName?: string;
  specialty?: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
  appointmentDate: Date | string;
  appointmentTime: string; // HH:MM
  durationMinutes?: number;
  status: AppointmentStatus;
  notes?: string;
  reminderMinutes: number[];
  isVirtual: boolean;
  meetingUrl?: string;
  documents: ObjectId[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// Routine
// ---------------------------------------------------------------------------

export interface Routine {
  _id: ObjectId;
  careProfile: ObjectId | CareProfile;
  createdBy: ObjectId | User;
  title: string;
  description?: string;
  iconName?: string;
  frequency: RoutineFrequency;
  daysOfWeek?: DayOfWeek[];
  scheduledTime: string; // HH:MM
  durationMinutes?: number;
  isActive: boolean;
  streakCount: number;
  longestStreak: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// RoutineCompletion
// ---------------------------------------------------------------------------

export interface RoutineCompletion {
  _id: ObjectId;
  routine: ObjectId | Routine;
  careProfile: ObjectId | CareProfile;
  completedBy: ObjectId | User;
  scheduledDate: Date | string;
  completedAt: Date | string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// HealthObservation
// ---------------------------------------------------------------------------

export interface HealthObservation {
  _id: ObjectId;
  careProfile: ObjectId | CareProfile;
  recordedBy: ObjectId | User;
  type: ObservationType;
  value: number | string;
  unit?: string;
  value2?: number; // e.g., diastolic BP
  notes?: string;
  recordedAt: Date | string;
  source: 'manual' | 'device';
  deviceName?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// EmergencyContact (standalone model)
// ---------------------------------------------------------------------------

export interface EmergencyContact {
  _id: ObjectId;
  careProfile: ObjectId | CareProfile;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// MedicalDocument
// ---------------------------------------------------------------------------

export interface MedicalDocument {
  _id: ObjectId;
  careProfile: ObjectId | CareProfile;
  uploadedBy: ObjectId | User;
  type: DocumentType;
  title: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  documentDate?: Date | string;
  tags: string[];
  isArchived: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// NotificationPreference
// ---------------------------------------------------------------------------

export interface NotificationPreference {
  _id: ObjectId;
  user: ObjectId | User;
  careProfile?: ObjectId | CareProfile;
  doseReminders: boolean;
  doseReminderChannels: NotificationChannel[];
  doseReminderLeadMinutes: number;
  appointmentReminders: boolean;
  appointmentReminderChannels: NotificationChannel[];
  appointmentReminderLeadMinutes: number;
  routineReminders: boolean;
  routineReminderChannels: NotificationChannel[];
  missedDoseAlerts: boolean;
  missedDoseAlertChannels: NotificationChannel[];
  weeklyDigest: boolean;
  weeklyDigestDay: number; // 0=Sun, 6=Sat
  quietHoursStart?: string; // HH:MM
  quietHoursEnd?: string;   // HH:MM
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// Notification
// ---------------------------------------------------------------------------

export interface Notification {
  _id: ObjectId;
  recipient: ObjectId | User;
  careProfile?: ObjectId | CareProfile;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  status: NotificationStatus;
  readAt?: Date | string;
  relatedModel?: string;
  relatedId?: ObjectId;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// DeliveryAttempt
// ---------------------------------------------------------------------------

export interface DeliveryAttempt {
  _id: ObjectId;
  notification: ObjectId | Notification;
  channel: NotificationChannel;
  status: DeliveryStatus;
  attemptedAt: Date | string;
  deliveredAt?: Date | string;
  errorMessage?: string;
  providerMessageId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// AuditLog
// ---------------------------------------------------------------------------

export interface AuditLog {
  _id: ObjectId;
  actor: ObjectId | User;
  actorRole: UserRole;
  careProfile?: ObjectId | CareProfile;
  action: AuditAction;
  resourceType: string;
  resourceId?: ObjectId;
  diff?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date | string;
}

// ---------------------------------------------------------------------------
// RefreshToken
// ---------------------------------------------------------------------------

export interface RefreshToken {
  _id: ObjectId;
  user: ObjectId | User;
  tokenHash: string;
  deviceInfo?: string;
  ipAddress?: string;
  expiresAt: Date | string;
  revokedAt?: Date | string;
  createdAt: Date | string;
}

// ---------------------------------------------------------------------------
// PushSubscription
// ---------------------------------------------------------------------------

export interface PushSubscriptionEndpoint {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushSubscription {
  _id: ObjectId;
  user: ObjectId | User;
  subscription: PushSubscriptionEndpoint;
  deviceName?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ---------------------------------------------------------------------------
// API Response wrappers
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ---------------------------------------------------------------------------
// Auth types
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken?: string; // only if not using httpOnly cookies
}

// ---------------------------------------------------------------------------
// Dashboard / Summary types
// ---------------------------------------------------------------------------

export interface TodaySummary {
  pendingDoses: number;
  completedDoses: number;
  totalDoses: number;
  adherencePercent: number;
  upcomingAppointments: Appointment[];
  pendingRoutines: Routine[];
  recentNotifications: Notification[];
  streakDays: number;
}

export interface AdherenceStats {
  period: 'week' | 'month' | 'quarter';
  overallPercent: number;
  byMedication: {
    medication: Medication;
    takenCount: number;
    missedCount: number;
    skippedCount: number;
    percent: number;
  }[];
  dailyBreakdown: {
    date: string;
    taken: number;
    missed: number;
    skipped: number;
    total: number;
  }[];
}
