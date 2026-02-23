import mongoose from "mongoose";

const UtilityPoolSchema = new mongoose.Schema(
  {
    utility: {
      type: String,
      enum: ["AIRTIME", "DATA", "DSTV"],
      unique: true,
      required: true,
    },

    balanceATC: {
      type: Number,
      default: 0,
    },

    rate: {
      type: Number,
      required: true,
      // example: 1 ATC = 1 GHS airtime
    },

    dailyLimitATC: {
      type: Number,
      default: 1000,
    },

    spentTodayATC: {
      type: Number,
      default: 0,
    },

    paused: {
      type: Boolean,
      default: false,
    },

    lastReset: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

export default mongoose.model("UtilityPool", UtilityPoolSchema);