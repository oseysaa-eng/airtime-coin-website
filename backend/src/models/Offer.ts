import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema(
  {
    userId: String,
    network: String,
    taskId: String,
    rewardMinutes: Number,
    ip: String,
    country: String,
    fingerprint: String,
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Offer", OfferSchema);
