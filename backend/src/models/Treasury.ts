import mongoose from "mongoose";

const TreasurySchema = new mongoose.Schema(
  {
    balanceATC: { type: Number, default: 0 },
    totalBurnedATC: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Treasury", TreasurySchema);