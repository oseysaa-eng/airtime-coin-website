import mongoose from "mongoose";

const UtilityPricingSchema = new mongoose.Schema(
  {
    basePrice: { type: Number, default: 1 }, // 1 ATC = 1 GHS
    minPrice: { type: Number, default: 0.3 },
    maxPrice: { type: Number, default: 5 },

    updatedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("UtilityPricing", UtilityPricingSchema);