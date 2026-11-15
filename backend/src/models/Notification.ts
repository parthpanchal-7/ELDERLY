import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationType =
  | 'dose_due'
  | 'dose_missed'
  | 'dose_escalation'
  | 'appointment_reminder'
  | 'routine_reminder'
  | 'refill_alert'
  | 'care_circle_invite'
  | 'care_circle_joined'
  | 'care_circle_revoked'
  | 'general';

export interface INotification extends Document {
  careProfile: Types.ObjectId;
  recipientUser: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  channel: 'push' | 'sms' | 'email' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  relatedEntityId?: Types.ObjectId;
  relatedEntityType?: 'medication' | 'dose' | 'appointment' | 'routine' | 'care_circle';
  readAt?: Date;
  sentAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    recipientUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'dose_due',
        'dose_missed',
        'dose_escalation',
        'appointment_reminder',
        'routine_reminder',
        'refill_alert',
        'care_circle_invite',
        'care_circle_joined',
        'care_circle_revoked',
        'general',
      ],
      default: 'general',
      index: true,
    },
    channel: {
      type: String,
      enum: ['push', 'sms', 'email', 'in_app'],
      default: 'in_app',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
      default: 'pending',
      index: true,
    },
    relatedEntityId: { type: Schema.Types.ObjectId },
    relatedEntityType: {
      type: String,
      enum: ['medication', 'dose', 'appointment', 'routine', 'care_circle'],
    },
    readAt: { type: Date },
    sentAt: { type: Date },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
