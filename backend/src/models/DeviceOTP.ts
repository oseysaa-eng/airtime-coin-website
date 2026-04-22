import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DeviceOTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    fingerprint: {
      type: String,
      required: true,
      index: true,
    },

    /* 🔐 STORE HASHED OTP */
    otpHash: {
      type: String,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    lockUntil: {
      type: Date,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0, // ✅ TTL (ONLY ONE)
    },
  },
  { timestamps: true }
);

/* 🔥 COMPOUND INDEX (FAST LOOKUPS) */
DeviceOTPSchema.index({ userId: 1, fingerprint: 1 });

/* 🔐 HASH OTP BEFORE SAVE */
DeviceOTPSchema.pre("save", async function () {
  if (!this.isModified("otpHash")) return;

  this.otpHash = await bcrypt.hash(this.otpHash, 10);
});

/* 🔐 VERIFY METHOD */
DeviceOTPSchema.methods.verifyOTP = async function (otp: string) {
  return bcrypt.compare(otp, this.otpHash);
};

export default mongoose.model("DeviceOTP", DeviceOTPSchema);