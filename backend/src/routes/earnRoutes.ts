import express from "express";
import auth from "../middleware/authMiddleware";

import SystemSettings from "../models/SystemSettings";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";

import { rewardEngine } from "../services/rewardEngine";

const router = express.Router();

/* ================= DATE HELPER ================= */
const todayStr = () => new Date().toISOString().slice(0, 10);

/* ==================================
   POST /api/earn (Daily Bonus)
================================== */
router.post("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = todayStr();

    /* ================= SETTINGS ================= */
    const settings = await SystemSettings.findOne().lean();

    if (settings?.rewardsPaused) {
      return res.status(403).json({
        message: "Rewards paused",
      });
    }

    /* ================= ATOMIC CLAIM CHECK ================= */
    const existing = await UserDailyStats.findOne({
      userId,
      date: today,
      dailyBonusClaimed: true,
    }).lean();

    if (existing) {
      return res.status(403).json({
        message: "Daily bonus already claimed",
      });
    }

    /* ================= TRUST ================= */
    let trust = await UserTrust.findOne({ userId });

    if (!trust) {
      trust = await UserTrust.create({ userId });
    }

    if (trust.score < 40) {
      return res.status(403).json({
        message: "Trust blocked",
      });
    }

    /* ================= REWARD ================= */
    const baseMinutes =
      settings?.beta?.active
        ? settings.beta.dailyBonusMinutes || 3
        : 3;

    let multiplier = 1;
    if (trust.score < 80) multiplier = 0.8;
    if (trust.score < 60) multiplier = 0.5;

    const MINUTES = Math.floor(baseMinutes * multiplier);

    if (MINUTES <= 0) {
      return res.json({
        success: true,
        earnedMinutes: 0,
      });
    }

    /* ================= 🚀 FAST RESPONSE ================= */
    res.json({
      success: true,
      earnedMinutes: MINUTES,
    });

    /* ================= 🔥 BACKGROUND PROCESS ================= */
    (async () => {
      try {
        /* ================= REWARD ================= */
        await rewardEngine({
          userId,
          minutes: MINUTES,
          source: "DAILY_BONUS",
        });

        /* ================= MARK CLAIMED ================= */
        await UserDailyStats.updateOne(
          { userId, date: today },
          {
            $set: {
              dailyBonusClaimed: true,
              lastClaimAt: new Date(),
            },
            $inc: {
              minutesEarned: MINUTES,
            },
          },
          { upsert: true }
        );

      } catch (err) {
        console.error("⚠️ Daily bonus background error:", err);
      }
    })();

  } catch (err) {
    console.error("DAILY BONUS ERROR:", err);

    res.status(500).json({
      message: "Failed to claim daily bonus",
    });
  }
});

export default router;