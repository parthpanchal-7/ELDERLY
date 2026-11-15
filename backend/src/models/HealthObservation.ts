import mongoose, { Schema, Document, Types } from 'mongoose';

export type ObservationType =
  | 'blood_pressure'
  | 'blood_sugar'
  | 'weight'
  | 'temperature'
  | 'heart_rate'
  | 'oxygen_saturation'
  | 'mood'
  | 'pain_level'
  | 'custom';

export interface IHealthObservation extends Document {
  careProfile: Types.ObjectId;
  recordedBy: Types.ObjectId;
  type: ObservationType;
  value: number;
  secondaryValue?: number;
  unit: string;
  notes?: string;
  userEnteredContext?: string;
  observedAt: Date;
  createdAt: Date;
}

const HealthObservationSchema = new Schema<IHealthObservation>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'blood_pressure',
        'blood_sugar',
        'weight',
        'temperature',
        'heart_rate',
        'oxygen_saturation',
        'mood',
        'pain_level',
        'custom',
      ],
      required: true,
      index: true,
    },
    value: { type: Number, required: true },
    secondaryValue: { type: Number },
    unit: { type: String, required: true },
    notes: { type: String },
    userEnteredContext: { type: String },
    observedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const HealthObservation =
  mongoose.models.HealthObservation ||
  mongoose.model<IHealthObservation>('HealthObservation', HealthObservationSchema);
