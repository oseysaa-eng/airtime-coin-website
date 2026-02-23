// src/models/Kyc.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IKyc extends Document {
  userId: mongoose.Types.ObjectId;
  idNumber: string;
  frontUrl: string;
  backUrl: string;
  selfieUrl: string;
  status: "pending" | "approved" | "rejected";
  adminNote?: string;
  createdAt?: Date;
  updatedAt?: Date;
  ocrText?: string;
  faceDetected?: boolean;
}

const KycSchema = new Schema<IKyc>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  idNumber: { type: String, required: true },
  frontUrl: { type: String, required: true },
  backUrl: { type: String, required: true },
  selfieUrl: { type: String, required: true },
  status: { type: String, enum: ["pending","approved","rejected"], default: "pending" },
  adminNote: { type: String },
  ocrText: { type: String },
  faceDetected: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Kyc || mongoose.model<IKyc>("Kyc", KycSchema);
