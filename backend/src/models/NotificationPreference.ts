import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotificationPreference extends Document {
  careProfile: Types.ObjectId;
  user: Types.ObjectId;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  phoneForSms?: string;
  emailAddress?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  quietHoursEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    pushEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: false },
    emailEnabled: { type: Boolean, default: true },
    phoneForSms: { type: String },
    emailAddress: { type: String },
    quietHoursStart: { type: String, default: '22:00' },
    quietHoursEnd: { type: String, default: '07:00' },
    quietHoursEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationPreferenceSchema.index({ careProfile: 1, user: 1 }, { unique: true });

export const NotificationPreference =
  mongoose.models.NotificationPreference ||
  mongoose.model<INotificationPreference>('NotificationPreference', NotificationPreferenceSchema);
