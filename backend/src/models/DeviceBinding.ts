import mongoose from "mongoose";

const DeviceBindingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "DeviceBinding",
  DeviceBindingSchema
);