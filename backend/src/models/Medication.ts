import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMedication extends Document {
  careProfile: Types.ObjectId;
  name: string;
  genericName?: string;
  brandName?: string;
  strength: string;
  unit: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'inhaler' | 'patch' | 'ointment' | 'other';
  color?: string;
  shape?: string;
  instructions: string;
  mealContext?: 'before_meal' | 'with_meal' | 'after_meal' | 'empty_stomach' | 'no_restriction';
  frequency: 'daily' | 'twice_daily' | 'thrice_daily' | 'custom_times' | 'specific_days' | 'as_needed';
  scheduleTimes: string[];
  daysOfWeek?: number[];
  startDate: Date;
  endDate?: Date;
  prescribingDoctor?: string;
  prescriptionNumber?: string;
  currentInventory?: number;
  refillThreshold?: number;
  refillPackSize?: number;
  status: 'active' | 'paused' | 'discontinued';
  pausedAt?: Date;
  discontinuedAt?: Date;
  discontinueReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema<IMedication>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    brandName: { type: String, trim: true },
    strength: { type: String, required: true },
    unit: { type: String, required: true },
    form: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'patch', 'ointment', 'other'],
      default: 'tablet',
    },
    color: { type: String },
    shape: { type: String },
    instructions: { type: String, default: 'Take as directed' },
    mealContext: {
      type: String,
      enum: ['before_meal', 'with_meal', 'after_meal', 'empty_stomach', 'no_restriction'],
      default: 'no_restriction',
    },
    frequency: {
      type: String,
      enum: ['daily', 'twice_daily', 'thrice_daily', 'custom_times', 'specific_days', 'as_needed'],
      default: 'daily',
    },
    scheduleTimes: [{ type: String, required: true }],
    daysOfWeek: [{ type: Number }],
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    prescribingDoctor: { type: String },
    prescriptionNumber: { type: String },
    currentInventory: { type: Number, default: 30 },
    refillThreshold: { type: Number, default: 5 },
    refillPackSize: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['active', 'paused', 'discontinued'],
      default: 'active',
      index: true,
    },
    pausedAt: { type: Date },
    discontinuedAt: { type: Date },
    discontinueReason: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Medication =
  mongoose.models.Medication || mongoose.model<IMedication>('Medication', MedicationSchema);
