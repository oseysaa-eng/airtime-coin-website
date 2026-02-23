import mongoose from "mongoose";

const UserDailyStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    dailyBonusClaimed: {
      type: Boolean,
      default: false,
    },

    adsWatched: {
      type: Number,
      default: 0,
    },

    minutesEarned: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

UserDailyStatsSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model(
  "UserDailyStats",
  UserDailyStatsSchema
);