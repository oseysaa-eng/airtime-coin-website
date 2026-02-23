import mongoose from "mongoose";

const ATCPriceSchema = new mongoose.Schema(
  {
    currentPrice: {
      type: Number,
      required: true,
    },

    previousPrice: Number,

    changePercent: Number,

    trend: {
      type: String,
      enum: ["up", "down", "flat"],
      default: "flat",
    },

    // 🔐 ADMIN CONTROL
    mode: {
      type: String,
      enum: ["AUTO", "MANUAL", "FROZEN"],
      default: "AUTO",
    },

    manualPrice: Number,

    freezeReason: String,

    breakdown: Object,
  },
  { timestamps: true }
);

export default mongoose.model("ATCPrice", ATCPriceSchema);