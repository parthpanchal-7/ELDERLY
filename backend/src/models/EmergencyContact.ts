import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEmergencyContact extends Document {
  careProfile: Types.ObjectId;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  isPrimary: boolean;
  priorityOrder: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    isPrimary: { type: Boolean, default: false },
    priorityOrder: { type: Number, default: 1 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const EmergencyContact =
  mongoose.models.EmergencyContact ||
  mongoose.model<IEmergencyContact>('EmergencyContact', EmergencyContactSchema);
