import mongoose, { Schema, Document, Types } from 'mongoose';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed';

export interface IAppointment extends Document {
  careProfile: Types.ObjectId;
  title: string;
  doctorName: string;
  specialty?: string;
  clinicOrHospital: string;
  locationAddress?: string;
  appointmentDateTime: Date;
  status: AppointmentStatus;
  notes?: string;
  reminderMinutesBefore: number[];
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    title: { type: String, required: true, trim: true },
    doctorName: { type: String, required: true, trim: true },
    specialty: { type: String, trim: true },
    clinicOrHospital: { type: String, required: true, trim: true },
    locationAddress: { type: String, trim: true },
    appointmentDateTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'missed'],
      default: 'scheduled',
      index: true,
    },
    notes: { type: String },
    reminderMinutesBefore: [{ type: Number, default: [1440, 60] }],
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

export const Appointment =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
