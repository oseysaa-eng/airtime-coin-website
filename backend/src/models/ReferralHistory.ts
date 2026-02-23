// src/models/ReferralHistory.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IReferralHistory extends Document {
  inviterId: mongoose.Types.ObjectId;
  invitedId: mongoose.Types.ObjectId;
  invitedEmail?: string;
  reward: number; // ATC rewarded to inviter
  reason: string; // e.g. "register", "first_deposit"
  createdAt?: Date;
}

const ReferralHistorySchema = new Schema<IReferralHistory>(
  {
    inviterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invitedId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invitedEmail: { type: String },
    reward: { type: Number, default: 0 },
    reason: { type: String, default: "register" },
  },
  { timestamps: true }
);

export default mongoose.models.ReferralHistory ||
  mongoose.model<IReferralHistory>("ReferralHistory", ReferralHistorySchema);
