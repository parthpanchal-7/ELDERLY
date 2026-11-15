import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRoutineCompletion extends Document {
  careProfile: Types.ObjectId;
  routine: Types.ObjectId;
  completedAt: Date;
  completedBy: Types.ObjectId;
  notes?: string;
}

const RoutineCompletionSchema = new Schema<IRoutineCompletion>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    routine: { type: Schema.Types.ObjectId, ref: 'Routine', required: true, index: true },
    completedAt: { type: Date, default: Date.now },
    completedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RoutineCompletion =
  mongoose.models.RoutineCompletion ||
  mongoose.model<IRoutineCompletion>('RoutineCompletion', RoutineCompletionSchema);
