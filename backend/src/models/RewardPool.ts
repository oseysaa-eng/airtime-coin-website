import mongoose from "mongoose";

const RewardPoolSchema = new mongoose.Schema(
{
  type: {
    type: String,
    enum: ["CALL_SESSION", "ADS", "SURVEY", "DAILY_BONUS"], // ✅ FIXED
    required: true,
    unique: true,
    index: true
  },

  balanceATC: {
    type: Number,
    default: 0
  },

  dailyLimitATC: {
    type: Number,
    default: 50000
  },

  spentTodayATC: {
    type: Number,
    default: 0
  },

  paused: {
    type: Boolean,
    default: false
  },

  lastReset: {
    type: Date,
    default: Date.now
  }

},
{ timestamps: true }
);

export default mongoose.model("RewardPool", RewardPoolSchema);