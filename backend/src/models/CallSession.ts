import mongoose from "mongoose";

const CallSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, index: true },

    sessionId: {
    type: String,
    required: true,
    unique: true,
  },
   startTime: Date,
  endTime: Date,

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




