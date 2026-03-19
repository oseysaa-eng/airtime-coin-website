import mongoose from "mongoose";

const FraudEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, index: true },
  deviceId: { type: mongoose.Types.ObjectId },

  type: String,
  severity: {
    type: String,
    enum: ["low","medium","high","critical"],
    default: "low"
  },

  message: String,

  meta: Object

}, { timestamps: true });

export default mongoose.model("FraudEvent", FraudEventSchema);