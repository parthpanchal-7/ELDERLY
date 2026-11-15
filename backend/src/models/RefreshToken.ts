import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  tokenHash: string;
  family: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true },
    family: { type: String, required: true, index: true },
    isRevoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken =
  mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
