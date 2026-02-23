import mongoose from "mongoose";

const DeviceOTPSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fingerprint: String,
    otp: String,
    expiresAt: Date,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("DeviceOTP", DeviceOTPSchema);

