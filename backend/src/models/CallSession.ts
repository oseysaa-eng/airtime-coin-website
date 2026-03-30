// models/CallSession.ts
import mongoose from "mongoose";

const callSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },

    sessionId: { type: String, required: true, unique: true }, // ✅ UNIQUE

    phoneNumber: String,

    durationSeconds: { type: Number, default: 0 },
    creditedMinutes: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "valid", "rejected", "fraud"],
      default: "pending",
    },

    trustScore: { type: Number, default: 1 },

    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("CallSession", callSessionSchema);