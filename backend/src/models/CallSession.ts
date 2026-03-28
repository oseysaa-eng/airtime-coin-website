import mongoose from "mongoose";

const CallSessionSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
  },

  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  phoneNumber: String,

  startTime: Date,
  endTime: Date,

  durationSeconds: {
    type: Number,
    default: 0,
  },

  creditedATC: {
    type: Number,
    default: 0,
  },

  deviceId: mongoose.Schema.Types.ObjectId,

  status: {
    type: String,
    enum: ["valid", "rejected", "fraud"],
    default: "valid",
  },

  reason: String,

},
{ timestamps: true }
);

export default mongoose.model("CallSession", CallSessionSchema);