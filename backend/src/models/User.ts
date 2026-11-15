import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  googleId?: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  primaryRole: 'profile_owner' | 'family_member' | 'caregiver';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  preferredLanguage: 'en' | 'hi';
  timezone: string;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  lastLoginAt?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    primaryRole: {
      type: String,
      enum: ['profile_owner', 'family_member', 'caregiver'],
      default: 'profile_owner',
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    preferredLanguage: { type: String, enum: ['en', 'hi'], default: 'en' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    isActive: { type: Boolean, default: true },
    hasCompletedOnboarding: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpiry: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
