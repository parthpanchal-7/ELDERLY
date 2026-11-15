import mongoose, { Schema, Document, Types } from 'mongoose';

export type DoseStatus = 'scheduled' | 'due' | 'taken' | 'skipped' | 'missed' | 'snoozed' | 'unconfirmed';

export interface IDoseOccurrence extends Document {
  careProfile: Types.ObjectId;
  medication: Types.ObjectId;
  scheduledTime: Date;
  status: DoseStatus;
  takenAt?: Date;
  takenBy?: Types.ObjectId;
  snoozedUntil?: Date;
  skippedAt?: Date;
  skippedBy?: Types.ObjectId;
  skipReason?: string;
  notes?: string;
  escalatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DoseOccurrenceSchema = new Schema<IDoseOccurrence>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    medication: { type: Schema.Types.ObjectId, ref: 'Medication', required: true, index: true },
    scheduledTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['scheduled', 'due', 'taken', 'skipped', 'missed', 'snoozed', 'unconfirmed'],
      default: 'scheduled',
      index: true,
    },
    takenAt: { type: Date },
    takenBy: { type: Schema.Types.ObjectId, ref: 'User' },
    snoozedUntil: { type: Date },
    skippedAt: { type: Date },
    skippedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    skipReason: { type: String },
    notes: { type: String },
    escalatedAt: { type: Date },
  },
  { timestamps: true }
);

DoseOccurrenceSchema.index({ medication: 1, scheduledTime: 1 }, { unique: true });

export const DoseOccurrence =
  mongoose.models.DoseOccurrence ||
  mongoose.model<IDoseOccurrence>('DoseOccurrence', DoseOccurrenceSchema);
