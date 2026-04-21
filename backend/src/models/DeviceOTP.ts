import mongoose from "mongoose";

const DeviceOTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    fingerprint: {
      type: String,
      index: true,
    },

    otp: String,

    attempts: { type: Number, default: 0 },

    verified: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      expires: 0, 
    },
    
  },
  { timestamps: true }
);

/* 🔥 AUTO CLEANUP (TTL INDEX) */
DeviceOTPSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("DeviceOTP", DeviceOTPSchema);