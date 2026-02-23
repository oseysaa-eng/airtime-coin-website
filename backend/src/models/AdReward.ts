// src/models/AdReward.ts
import mongoose from "mongoose";

const AdRewardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    adRewardId: { type: String, required: true, unique: true },
    network: { type: String },
    rewardMinutes: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("AdReward", AdRewardSchema);