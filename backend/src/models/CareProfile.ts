import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmergencyContactEmbedded {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface ICareProfile extends Document {
  owner: Types.ObjectId;
  fullName: string;
  dateOfBirth: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: string[];
  primaryPhysician?: string;
  primaryPhysicianPhone?: string;
  primaryPhysicianEmail?: string;
  emergencyContacts: IEmergencyContactEmbedded[];
  avatarUrl?: string;
  bio?: string;
  passcodePinHash?: string;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CareProfileSchema = new Schema<ICareProfile>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    bloodGroup: { type: String, trim: true },
    allergies: [{ type: String, trim: true }],
    chronicConditions: [{ type: String, trim: true }],
    primaryPhysician: { type: String, trim: true },
    primaryPhysicianPhone: { type: String, trim: true },
    primaryPhysicianEmail: { type: String, trim: true },
    emergencyContacts: [
      {
        name: { type: String, required: true },
        relationship: { type: String, required: true },
        phone: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    avatarUrl: { type: String },
    bio: { type: String },
    passcodePinHash: { type: String },
    hasCompletedOnboarding: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CareProfile = mongoose.models.CareProfile || mongoose.model<ICareProfile>('CareProfile', CareProfileSchema);
