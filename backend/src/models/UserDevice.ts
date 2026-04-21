import mongoose from "mongoose";

const UserDeviceSchema = new mongoose.Schema(
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

    /* DEVICE INFO */
    deviceName: String,
    platform: String,
    os: String,
    osVersion: String,
    appVersion: String,

    /* NETWORK */
    lastIp: String,

    /* SECURITY */
    trusted: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },

    riskScore: { type: Number, default: 0 },
    riskReasons: [String],

    /* ACTIVITY */
    loginCount: { type: Number, default: 1 },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },

    verifiedAt: Date,
  },
  { timestamps: true }
);

/* 🔥 PREVENT DUPLICATES */
UserDeviceSchema.index(
  { userId: 1, fingerprint: 1 },
  { unique: true }
);

export default mongoose.model("UserDevice", UserDeviceSchema);