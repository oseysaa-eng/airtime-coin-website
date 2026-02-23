import mongoose from "mongoose";

const ATCPriceHistorySchema = new mongoose.Schema(
  {
    price: {
      type: Number,
      required: true,
    },

    source: {
      type: String,
      default: "engine",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "ATCPriceHistory",
  ATCPriceHistorySchema
);