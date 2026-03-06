import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },

  balanceATC: { type: Number, default: 0 },
  stakedATC: { type: Number, default: 0 },

  totalMinutes: { type: Number, default: 0 },
  todayMinutes: { type: Number, default: 0 },

  totalEarnedATC: { type: Number, default: 0 },

  dailyEarned: {
    ads: { type: Number, default: 0 },
    calls: { type: Number, default: 0 },
    surveys: { type: Number, default: 0 }
  },

  lastDailyReset: { type: Date, default: Date.now },
  lastEarningReset: { type: Date, default: Date.now }

},
{ timestamps: true }
);

export default mongoose.model("Wallet", WalletSchema);