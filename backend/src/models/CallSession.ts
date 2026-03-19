import mongoose from "mongoose";

const CallSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, index: true },

  deviceId: mongoose.Types.ObjectId,

  phoneNumber: String,

  durationSeconds: Number,

  creditedMinutes: Number,

  status: {
    type: String,
    enum: ["valid", "rejected", "fraud"],
    default: "valid"
  },

  reason: String,

}, { timestamps: true });

export default mongoose.model("CallSession", CallSessionSchema);