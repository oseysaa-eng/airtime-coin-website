import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({

  /* USER */
  userId: {
    type: mongoose.Types.ObjectId,
    index: true,
    required: true
  },

  /* UNIQUE DEVICE ID */
  fingerprint: {
    type: String,
    required: true,
    index: true
  },

  deviceId: {
    type: String,
    index: true
  },

  /* DEVICE INFO */
  deviceName: String,
  brand: String,
  model: String,

  os: String,
  osVersion: String,
  platform: String,

  appVersion: String,

  /* SECURITY FLAGS */
  flagged: {
    type: Boolean,
    default: false
  },

  trusted: {
    type: Boolean,
    default: false
  },

  blocked: {
    type: Boolean,
    default: false
  },

  /* FRAUD DETECTION */
  riskScore: {
    type: Number,
    default: 0
  },

  riskReasons: [String],

  /* ACTIVITY */
  firstSeenAt: {
    type: Date,
    default: Date.now
  },

  lastSeenAt: {
    type: Date,
    default: Date.now
  },

  lastIp: String

}, { timestamps: true });

export default mongoose.model("Device", DeviceSchema);