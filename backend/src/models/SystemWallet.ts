import mongoose from "mongoose";

const SystemWalletSchema = new mongoose.Schema(
  {
    totalProfitATC: { type: Number, default: 0 },

    dailyProfitATC: { type: Number, default: 0 },
  

    totalConversions: { type: Number, default: 0 },

    profitFromCalls: { type: Number, default: 0 },
    profitFromAds: { type: Number, default: 0 },
    profitFromConversion: { type: Number, default: 0 },
    lastReset: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("SystemWallet", SystemWalletSchema);


