import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoutine extends Document {
  careProfile: Types.ObjectId;
  title: string;
  description?: string;
  category: 'hydration' | 'exercise' | 'nutrition' | 'sleep' | 'hygiene' | 'vital_check' | 'other';
  scheduleTimes: string[];
  daysOfWeek?: number[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoutineSchema = new Schema<IRoutine>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['hydration', 'exercise', 'nutrition', 'sleep', 'hygiene', 'vital_check', 'other'],
      default: 'hydration',
    },
    scheduleTimes: [{ type: String, required: true }],
    daysOfWeek: [{ type: Number }],
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Routine =
  mongoose.models.Routine || mongoose.model<IRoutine>('Routine', RoutineSchema);
