import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, index: true },

  deviceName: String,
  brand: String,
  model: String,
  os: String,
  osVersion: String,

  firstSeenAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date, default: Date.now },

  blocked: { type: Boolean, default: false }
});

export default mongoose.model("Device", DeviceSchema);