import mongoose, { Schema, Document, Types } from 'mongoose';

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'CONFIRM_DOSE'
  | 'SKIP_DOSE'
  | 'SNOOZE_DOSE'
  | 'CONFIRM_DOSE_PROXY'
  | 'INVITE_SENT'
  | 'INVITE_ACCEPTED'
  | 'INVITE_REVOKED'
  | 'CONSENT_GIVEN'
  | 'CONSENT_REVOKED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'EXPORT';

export interface IAuditLog extends Document {
  careProfile?: Types.ObjectId;
  actor: Types.ObjectId;
  action: AuditAction;
  targetEntity: string;
  targetEntityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: [
        'CREATE',
        'READ',
        'UPDATE',
        'DELETE',
        'CONFIRM_DOSE',
        'SKIP_DOSE',
        'SNOOZE_DOSE',
        'CONFIRM_DOSE_PROXY',
        'INVITE_SENT',
        'INVITE_ACCEPTED',
        'INVITE_REVOKED',
        'CONSENT_GIVEN',
        'CONSENT_REVOKED',
        'LOGIN',
        'LOGOUT',
        'TOKEN_REFRESH',
        'EXPORT',
      ],
      required: true,
      index: true,
    },
    targetEntity: { type: String, required: true },
    targetEntityId: { type: String },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
