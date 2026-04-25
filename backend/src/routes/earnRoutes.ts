import express from "express";
import auth from "../middleware/authMiddleware";

import SystemSettings from "../models/SystemSettings";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";

import { rewardEngine } from "../services/rewardEngine";
import { earnLimiter } from "../middleware/rateLimiter";

const router = express.Router();

/* ✅ DATE HELPER */
export const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

router.post("/", auth, earnLimiter, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = getToday();

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({ rewardsPaused: false });
    }

    if (settings.rewardsPaused) {
      return res.status(403).json({ message: "Rewards paused" });
    }

    /* ================= TRUST ================= */
    const trust = await UserTrust.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, score: 100 } },
      { new: true, upsert: true }
    );

    if (trust.score < 40) {
      return res.status(403).json({ message: "Trust blocked" });
    }

    /* ================= ENSURE DOC ================= */
    await UserDailyStats.updateOne(
      { userId, date: today },
      {
        $setOnInsert: {
          userId,
          date: today,
          dailyBonusClaimed: false,
        },
      },
      { upsert: true }
    );

    /* ================= CLAIM ================= */
    const claim = await UserDailyStats.findOneAndUpdate(
      {
        userId,
        date: today,
        dailyBonusClaimed: false,
      },
      {
        $set: {
          dailyBonusClaimed: true,
          lastClaimAt: new Date(),
        },
      },
      { new: true }
    );

    if (!claim) {
      return res.status(403).json({
        message: "Daily bonus already claimed",
      });
    }

    /* ================= REWARD CALC ================= */
    const baseMinutes = settings?.beta?.active
      ? settings.beta.dailyBonusMinutes || 3
      : 3;

    let multiplier = 1;
    if (trust.score < 80) multiplier = 0.8;
    if (trust.score < 60) multiplier = 0.5;

    const MINUTES = Math.floor(baseMinutes * multiplier);

    /* ================= REWARD ENGINE ================= */
    const result = await rewardEngine({
      userId,
      minutes: MINUTES,
      source: "DAILY_BONUS",
    });

    /* 🔥 HANDLE EDGE CASE (CAP HIT) */
    if (result.creditedMinutes === 0) {
      return res.status(403).json({
        message: "Daily earning limit reached",
      });
    }

    await UserDailyStats.updateOne(
      { userId, date: today },
      { $inc: { minutesEarned: result.creditedMinutes } }
    );

    return res.json({
      success: true,
      earnedMinutes: result.creditedMinutes,
    });

  } catch (err: any) {
    console.error("DAILY BONUS ERROR:", err);

    res.status(500).json({
      message: err.message || "Failed to claim daily bonus",
    });
  }
});

export default router;