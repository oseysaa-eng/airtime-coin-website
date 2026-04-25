import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema(
{
  /* ================= USER ================= */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },

  /* ================= BALANCE ================= */
  balanceATC: { type: Number, default: 0, min: 0 },
  stakedATC: { type: Number, default: 0, min: 0 },

  totalEarnedATC: { type: Number, default: 0, min: 0 },

  /* ================= MINUTES ================= */
  totalMinutes: { type: Number, default: 0, min: 0 },
  todayMinutes: { type: Number, default: 0, min: 0 },

  /* ================= DAILY BREAKDOWN ================= */
  dailyEarned: {
    ads: { type: Number, default: 0 },
    calls: { type: Number, default: 0 },
    surveys: { type: Number, default: 0 },
  },

  /* ================= RESET CONTROL ================= */
  lastDailyReset: { type: Date, default: Date.now },

  /* ================= SECURITY / TRACKING ================= */
  lastEarningAt: { type: Date, default: null },
  earningVelocity: { type: Number, default: 0 }, // mins per hour

  lastHourMinutes: { type: Number, default: 0 },
  lastHourReset: { type: Date, default: Date.now },

  dailySourceMinutes: {
    ADS: { type: Number, default: 0 },
    CALL: { type: Number, default: 0 },
    SURVEY: { type: Number, default: 0 },
    DAILY_BONUS: { type: Number, default: 0 },
    REFERRAL: { type: Number, default: 0 },
  },

  /* ================= SYSTEM ================= */
  version: { type: Number, default: 1 }, // future migrations

},
{ timestamps: true }
);




/* ================= INDEXES ================= */

// 🔥 fast leaderboard queries
WalletSchema.index({ totalMinutes: -1 });
WalletSchema.index({ balanceATC: -1 });

// 🔥 fraud detection
WalletSchema.index({ lastEarningAt: -1 });

export default mongoose.models.Wallet ||
  mongoose.model("Wallet", WalletSchema);