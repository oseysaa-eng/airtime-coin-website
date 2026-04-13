import express from "express";
import auth from "../middleware/authMiddleware";

import SystemSettings from "../models/SystemSettings";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";

import { rewardEngine } from "../services/rewardEngine";

const router = express.Router();

const todayStr = () => new Date().toISOString().slice(0, 10);

router.post("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = todayStr();
    /* ================= SETTINGS ================= */
let settings = await SystemSettings.findOne();

if (!settings) {
  settings = await SystemSettings.create({
    rewardsPaused: false,
  });
}

console.log("⚙️ RewardsPaused:", settings.rewardsPaused);

if (settings.rewardsPaused === true) {
  return res.status(403).json({
    message: "Rewards paused",
  });
}

    /* ================= 🔒 ATOMIC CLAIM LOCK ================= */
    const stats = await UserDailyStats.findOneAndUpdate(
      {
        userId,
        date: today,
        dailyBonusClaimed: { $ne: true }, // 🔥 key fix
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

    // ❌ Already claimed
    if (!stats || stats.dailyBonusClaimed !== true) {
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

    /* ================= 🔥 BACKGROUND ================= */
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

      } catch (err) {
        console.error("⚠️ Daily bonus error:", err);

        // 🔥 rollback claim if reward fails
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