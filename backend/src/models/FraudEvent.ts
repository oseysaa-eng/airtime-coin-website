import mongoose from "mongoose";

const FraudEventSchema = new mongoose.Schema(
{
  type: {
    type: String,
    required: true
  },

  severity: {
    type: String,
    enum: ["low","medium","high","critical"],
    default: "low"
  },

  message: String,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device"
  },

  meta: Object

},
{ timestamps: true }
);

export default mongoose.model("FraudEvent", FraudEventSchema);