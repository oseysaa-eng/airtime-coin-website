import mongoose from "mongoose";

const DeviceBindingSchema = new mongoose.Schema(
  {
    /* USER */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* DEVICE */
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },

    /* SECURITY INFO */
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    lastIp: String,

    trusted: {
      type: Boolean,
      default: false,
    },

    blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/* Prevent duplicate device bindings */
DeviceBindingSchema.index(
  { userId: 1, deviceId: 1 },
  { unique: true }
);

export default mongoose.model(
  "DeviceBinding",
  DeviceBindingSchema
);