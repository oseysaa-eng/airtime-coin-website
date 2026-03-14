import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, index: true },

  deviceName: String,
  brand: String,
  model: String,
  os: String,
  osVersion: String,

  flagged: { type: Boolean, default: false },
  trusted: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },

  firstSeenAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },
});

export default mongoose.model("Device", DeviceSchema);


