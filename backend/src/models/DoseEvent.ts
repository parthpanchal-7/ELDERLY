import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDoseEvent extends Document {
  doseOccurrence: Types.ObjectId;
  medication: Types.ObjectId;
  careProfile: Types.ObjectId;
  actor: Types.ObjectId;
  action: 'confirm_taken' | 'skip' | 'snooze' | 'auto_miss' | 'proxy_confirm';
  notes?: string;
  timestamp: Date;
}

const DoseEventSchema = new Schema<IDoseEvent>(
  {
    doseOccurrence: { type: Schema.Types.ObjectId, ref: 'DoseOccurrence', required: true, index: true },
    medication: { type: Schema.Types.ObjectId, ref: 'Medication', required: true, index: true },
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['confirm_taken', 'skip', 'snooze', 'auto_miss', 'proxy_confirm'],
      required: true,
    },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const DoseEvent =
  mongoose.models.DoseEvent || mongoose.model<IDoseEvent>('DoseEvent', DoseEventSchema);
