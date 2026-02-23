import mongoose from "mongoose";

const UserDeviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fingerprint: {
      type: String,
      required: true,
      index: true,
    },

    deviceName: String,
    platform: String,
    ip: String,

    trusted: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },

    riskScore: { type: Number, default: 0 },

    loginCount: { type: Number, default: 1 },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("UserDevice", UserDeviceSchema);