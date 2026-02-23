import mongoose from "mongoose";

const ReferralSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

ReferralSchema.statics.generateCode = function () {
  // simple unique-ish code
  return Math.random().toString(36).substring(2, 9).toUpperCase();
};

export default mongoose.model("Referral", ReferralSchema);
