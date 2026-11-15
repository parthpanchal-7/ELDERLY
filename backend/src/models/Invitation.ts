import mongoose, { Schema, Document, Types } from 'mongoose';
import { ICareCirclePermissions } from './CareCircleMembership.js';

export interface IInvitation extends Document {
  careProfile: Types.ObjectId;
  invitedBy: Types.ObjectId;
  role: 'family_member' | 'caregiver';
  relationshipToOwner: string;
  passcodeHash: string;
  inviteeEmail?: string;
  inviteePhone?: string;
  permissions: ICareCirclePermissions;
  status: 'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';
  attemptCount: number;
  maxAttempts: number;
  expiresAt: Date;
  acceptedAt?: Date;
  acceptedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['family_member', 'caregiver'], required: true },
    relationshipToOwner: { type: String, required: true },
    passcodeHash: { type: String, required: true },
    inviteeEmail: { type: String, lowercase: true, trim: true },
    inviteePhone: { type: String, trim: true },
    permissions: { type: Schema.Types.Mixed, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'revoked', 'expired'],
      default: 'pending',
      index: true,
    },
    attemptCount: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Invitation =
  mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);
