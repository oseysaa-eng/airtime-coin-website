// src/models/RewardPool.ts
import mongoose from "mongoose";

const RewardPoolSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["CALL", "ADS", "SURVEY"],
      required: true,
      unique: true,
    },

    balanceATC: { type: Number, default: 0 },
    dailyLimitATC: { type: Number, default: 0.5 },
    spentTodayATC: { type: Number, default: 0 },

    paused: { type: Boolean, default: false },
    lastReset: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("RewardPool", RewardPoolSchema);
