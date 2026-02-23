// src/models/KycSubmission.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IKycSubmission extends Document {
  userId: mongoose.Types.ObjectId;
  frontUrl?: string;
  backUrl?: string;
  selfieUrl?: string;
  status: "not_submitted" | "pending" | "verified" | "rejected";
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  meta?: any;
}

const KycSchema = new Schema<IKycSubmission>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  frontUrl: { type: String },
  backUrl: { type: String },
  selfieUrl: { type: String },
  status: { type: String, enum: ["not_submitted","pending","verified","rejected"], default: "not_submitted" },
  notes: { type: String, default: "" },
  meta: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.models.KycSubmission || mongoose.model<IKycSubmission>("KycSubmission", KycSchema);
