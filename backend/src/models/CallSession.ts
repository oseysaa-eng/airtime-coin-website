import mongoose from "mongoose";

const CallSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sessionId: { type: String, required: true },

    startedAt: Date,
    endedAt: Date,

    durationSeconds: { type: Number, default: 0 },
    creditedMinutes: { type: Number, default: 0 },

    ipAddress: String,
    deviceHash: String,

    flagged: { type: Boolean, default: false },
    flagReason: String,
  },
  { timestamps: true }
);

export default mongoose.model("CallSession", CallSessionSchema);
