import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICareCirclePermissions {
  canViewMedications: boolean;
  canConfirmDoses: boolean;
  canEditMedications: boolean;
  canViewAppointments: boolean;
  canEditAppointments: boolean;
  canViewObservations: boolean;
  canAddObservations: boolean;
  canViewDocuments: boolean;
  canUploadDocuments: boolean;
  canReceiveEscalations: boolean;
  canManageCareCircle: boolean;
  canExportData: boolean;
}

export interface ICareCircleMembership extends Document {
  careProfile: Types.ObjectId;
  user: Types.ObjectId;
  role: 'family_member' | 'caregiver';
  relationshipToOwner: string;
  permissions: ICareCirclePermissions;
  status: 'active' | 'suspended' | 'revoked';
  invitedBy?: Types.ObjectId;
  acceptedAt?: Date;
  revokedAt?: Date;
  revokedBy?: Types.ObjectId;
  revocationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionsSchema = new Schema<ICareCirclePermissions>(
  {
    canViewMedications: { type: Boolean, default: true },
    canConfirmDoses: { type: Boolean, default: false },
    canEditMedications: { type: Boolean, default: false },
    canViewAppointments: { type: Boolean, default: true },
    canEditAppointments: { type: Boolean, default: false },
    canViewObservations: { type: Boolean, default: true },
    canAddObservations: { type: Boolean, default: false },
    canViewDocuments: { type: Boolean, default: false },
    canUploadDocuments: { type: Boolean, default: false },
    canReceiveEscalations: { type: Boolean, default: true },
    canManageCareCircle: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false },
  },
  { _id: false }
);

const CareCircleMembershipSchema = new Schema<ICareCircleMembership>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['family_member', 'caregiver'], required: true },
    relationshipToOwner: { type: String, required: true },
    permissions: { type: PermissionsSchema, required: true },
    status: { type: String, enum: ['active', 'suspended', 'revoked'], default: 'active', index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: { type: Date },
    revokedAt: { type: Date },
    revokedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    revocationReason: { type: String },
  },
  { timestamps: true }
);

CareCircleMembershipSchema.index({ careProfile: 1, user: 1 }, { unique: true });

export const CareCircleMembership =
  mongoose.models.CareCircleMembership ||
  mongoose.model<ICareCircleMembership>('CareCircleMembership', CareCircleMembershipSchema);
