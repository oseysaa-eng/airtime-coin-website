import express from "express";
import auth from "../middleware/authMiddleware";

import SystemSettings from "../models/SystemSettings";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";

import { rewardEngine } from "../services/rewardEngine";

const router = express.Router();

/* ✅ DATE HELPER */
export const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

router.post("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = getToday();

    /* ================= SETTINGS ================= */
    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = await SystemSettings.create({
        rewardsPaused: false,
      });
    }

    if (settings.rewardsPaused === true) {
      return res.status(403).json({
        message: "Rewards paused",
      });
    }

    /* ================= ENSURE DOC EXISTS ================= */
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

    /* ================= ATOMIC CLAIM ================= */
    const claim = await UserDailyStats.findOneAndUpdate(
      {
        userId,
        date: today,
        dailyBonusClaimed: false, // ✅ SAFE CONDITION
      },
      {
        $set: {
          dailyBonusClaimed: true,
          lastClaimAt: new Date(),
        },
      },
      { new: true }
    );

    /* ❌ Already claimed */
    if (!claim) {
      return res.status(403).json({
        message: "Daily bonus already claimed",
      });
    }

    /* ================= TRUST ================= */
    const trust = await UserTrust.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          score: 100,
        },
      },
      { new: true, upsert: true }
    );

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

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      earnedMinutes: MINUTES,
    });

    /* ================= BACKGROUND ================= */
    (async () => {
      try {
        await rewardEngine({
          userId,
          minutes: MINUTES,
          source: "DAILY_BONUS",
        });

        await UserDailyStats.updateOne(
          { userId, date: today },
          {
            $inc: {
              minutesEarned: MINUTES,
            },
          }
        );

      } catch (err: any) {
        console.error("❌ Daily bonus error:", err.message);

        // 🔥 rollback ONLY if reward failed
        await UserDailyStats.updateOne(
          { userId, date: today },
          {
            $set: { dailyBonusClaimed: false },
          }
        );
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