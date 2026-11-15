import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConsentRecord extends Document {
  careProfile: Types.ObjectId;
  user: Types.ObjectId;
  scope: 'data_processing' | 'health_record_sharing' | 'notifications' | 'emergency_escalation';
  granted: boolean;
  ipAddress?: string;
  userAgent?: string;
  version: string;
  grantedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
}

const ConsentRecordSchema = new Schema<IConsentRecord>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scope: {
      type: String,
      enum: ['data_processing', 'health_record_sharing', 'notifications', 'emergency_escalation'],
      required: true,
    },
    granted: { type: Boolean, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    version: { type: String, default: '1.0' },
    grantedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ConsentRecord =
  mongoose.models.ConsentRecord ||
  mongoose.model<IConsentRecord>('ConsentRecord', ConsentRecordSchema);
