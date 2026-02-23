import express from "express";
import auth from "../middleware/authMiddleware";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";
import { creditUser } from "../services/creditService";

const router = express.Router();

/**
 * 🎁 DAILY BONUS
 * POST /api/earn/daily
 */
router.post("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Global settings
    const settings = await SystemSettings.findOne();

    if (settings?.rewardsPaused) {
      return res.status(403).json({
        code: "REWARDS_PAUSED",
        message: "Rewards are temporarily paused",
      });
    }

    if (settings?.beta?.active && !settings.beta.showDailyBonus) {
      return res.status(403).json({
        code: "BETA_DAILY_DISABLED",
        message: "Daily bonus is disabled during beta",
      });
    }

    // 2️⃣ Daily stats (per day)
    const today = new Date().toISOString().slice(0, 10);

    let stats = await UserDailyStats.findOne({ userId, date: today });

    if (!stats) {
      stats = await UserDailyStats.create({
        userId,
        date: today,
      });
    }

    if (stats.dailyBonusClaimed) {
      return res.status(403).json({
        code: "DAILY_ALREADY_CLAIMED",
        message: "Daily bonus already claimed",
      });
    }

    // 3️⃣ Trust check
    const trust =
      (await UserTrust.findOne({ userId })) ||
      (await UserTrust.create({ userId }));

    if (trust.score < 40) {
      return res.status(403).json({
        code: "TRUST_BLOCKED",
        message: "Daily bonus blocked due to trust status",
      });
    }

    // 4️⃣ Credit reward
    const MINUTES = settings?.beta?.active
      ? settings.beta.dailyBonusMinutes || 3
      : 3;

    await creditUser(
      req.app.get("io"),
      userId,
      MINUTES,
      "DAILY_BONUS"
    );

    // 5️⃣ Update stats
    stats.dailyBonusClaimed = true;
    stats.minutesEarned += MINUTES;
    await stats.save();

    // 6️⃣ Log transaction
    await Transaction.create({
      userId,
      type: "EARN",
      amount: MINUTES,
      source: "DAILY_BONUS",
      meta: {
        beta: settings?.beta?.active || false,
      },
    });

    res.json({
      success: true,
      earnedMinutes: MINUTES,
      betaActive: settings?.beta?.active || false,
    });
  } catch (e) {
    console.error("DAILY BONUS ERROR:", e);
    res.status(500).json({
      message: "Failed to claim daily bonus",
    });
  }
});

export default router;