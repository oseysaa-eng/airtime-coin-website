import express from "express";
import auth from "../middleware/authMiddleware";

import SystemSettings from "../models/SystemSettings";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";

import { rewardEngine } from "../services/rewardEngine";

const router = express.Router();

/* ==================================
   POST /api/earn (Daily Bonus)
================================== */
router.post("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    /* ================= SETTINGS ================= */
    const settings = await SystemSettings.findOne();

    if (settings?.rewardsPaused) {
      return res.status(403).json({
        message: "Rewards paused",
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    /* ================= ATOMIC LOCK ================= */
    const stats = await UserDailyStats.findOneAndUpdate(
      {
        userId,
        date: today,
        dailyBonusClaimed: { $ne: true }, // 🔥 only allow if not claimed
      },
      {
        $setOnInsert: {
          userId,
          date: today,
        },
        $set: {
          dailyBonusClaimed: true,
          lastClaimAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    // ❌ Already claimed (lock failed)
    if (!stats || stats.dailyBonusClaimed !== true) {
      return res.status(403).json({
        message: "Daily bonus already claimed",
      });
    }

    /* ================= TRUST ================= */
    const trust =
      (await UserTrust.findOne({ userId })) ||
      (await UserTrust.create({ userId }));

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

    // 🔥 Trust multiplier
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

    /* ================= FAST RESPONSE ================= */
    res.json({
      success: true,
      earnedMinutes: MINUTES,
    });

    /* ================= BACKGROUND PROCESS ================= */
    (async () => {
      try {
        const io = req.app.get("io");

        await rewardEngine({
          userId,
          minutes: MINUTES,
          source: "DAILY_BONUS",
          io,
        });

        await UserDailyStats.updateOne(
          { userId, date: today },
          {
            $inc: {
              minutesEarned: MINUTES,
            },
          }
        );
      } catch (err) {
        console.error("⚠️ Daily bonus background error:", err);

        // rollback (optional)
        await UserDailyStats.updateOne(
          { userId, date: today },
          { $set: { dailyBonusClaimed: false } }
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