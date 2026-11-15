import mongoose, { Schema, Document, Types } from 'mongoose';

export type DocumentType =
  | 'prescription'
  | 'lab_report'
  | 'discharge_summary'
  | 'imaging'
  | 'insurance'
  | 'other';

export interface IMedicalDocument extends Document {
  careProfile: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  title: string;
  type: DocumentType;
  fileUrl: string;
  fileKey?: string;
  mimeType: string;
  fileSizeBytes: number;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalDocumentSchema = new Schema<IMedicalDocument>(
  {
    careProfile: { type: Schema.Types.ObjectId, ref: 'CareProfile', required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['prescription', 'lab_report', 'discharge_summary', 'imaging', 'insurance', 'other'],
      default: 'prescription',
      index: true,
    },
    fileUrl: { type: String, required: true },
    fileKey: { type: String },
    mimeType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    tags: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true }
);

export const MedicalDocument =
  mongoose.models.MedicalDocument ||
  mongoose.model<IMedicalDocument>('MedicalDocument', MedicalDocumentSchema);
