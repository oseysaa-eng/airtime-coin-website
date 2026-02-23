import express, { Request, Response } from "express";
import AdReward from "../models/AdReward";
import RewardPool from "../models/RewardPool";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";
import Wallet from "../models/Wallet";
import { verifyAdSignature } from "../utils/adSignature";

const router = express.Router();

/**
 * POST /api/ads/complete
 * Called after a rewarded ad is fully watched
 */
router.post("/complete", async (req: Request, res: Response) => {
  try {
    const {
      userId,
      adRewardId, // UNIQUE, GENERATED ON FRONTEND
      network,
      rewardMinutes,
      signature,
    } = req.body;

    /* ─────────────────────────
       BASIC VALIDATION
    ───────────────────────── */

    if (!userId || !adRewardId || !network || !rewardMinutes) {
      return res.status(400).json({
        message: "Missing required reward parameters",
      });
    }

    /* ─────────────────────────
       VERIFY AD SIGNATURE
    ───────────────────────── */

    if (!verifyAdSignature(req.body, signature)) {
      return res.status(403).json({
        message: "Invalid ad signature",
      });
    }

    /* ─────────────────────────
       IDEMPOTENCY CHECK (CRITICAL)
    ───────────────────────── */

    const alreadyRewarded = await AdReward.findOne({ adRewardId });
    if (alreadyRewarded) {
      return res.json({
        success: true,
        creditedMinutes: 0,
        duplicate: true,
      });
    }

    /* ─────────────────────────
       INCIDENT / KILL SWITCH
    ───────────────────────── */

    const settings = await SystemSettings.findOne();
    if (settings?.incidentMode?.active) {
      return res.status(403).json({
        message: "System temporarily unavailable",
        incident: settings.incidentMode.message,
      });
    }

    /* ─────────────────────────
       REWARD POOL CHECK
    ───────────────────────── */

    const pool = await RewardPool.findOne({ type: "ADS" });
    if (!pool || pool.paused) {
      return res.status(403).json({
        message: "Ad rewards are currently paused",
      });
    }

    /* ─────────────────────────
       TRUST & MULTIPLIER
    ───────────────────────── */

    const trust =
      (await UserTrust.findOne({ userId })) ||
      (await UserTrust.create({ userId }));

    if (trust.score < 40) {
      return res.status(403).json({
        message: "Rewards blocked due to trust status",
      });
    }

    let multiplier = 1;
    if (trust.score < 80) multiplier = 0.75;
    if (trust.score < 60) multiplier = 0.4;

    const creditedMinutes = Math.floor(rewardMinutes * multiplier);

    if (creditedMinutes <= 0) {
      return res.json({
        success: true,
        creditedMinutes: 0,
      });
    }

    
    /* ─────────────────────────
       DAILY LIMITS (BETA SAFETY)
    ───────────────────────── */

    const today = new Date().toISOString().slice(0, 10);

    let stats = await UserDailyStats.findOne({ userId, date: today });

    if (!stats) {
      stats = await UserDailyStats.create({
        userId,
        date: today,
        adsWatched: 0,
        minutesEarned: 0,
      });
    }

    if (stats.adsWatched >= 10) {
      return res.status(403).json({
        message: "Daily ad limit reached",
      });
    }

    if (stats.minutesEarned + creditedMinutes > 50) {
      return res.status(403).json({
        message: "Daily reward cap reached",
      });
    }

    /* ─────────────────────────
       WALLET UPDATE
    ───────────────────────── */

    const wallet =
      (await Wallet.findOne({ userId })) ||
      (await Wallet.create({ userId }));

    wallet.totalMinutes += creditedMinutes;
    wallet.todayMinutes += creditedMinutes;
    await wallet.save();

    /* ─────────────────────────
       LOCK REWARD (IDEMPOTENT)
    ───────────────────────── */


if (stats.lastAdAt) {
  const diff = Date.now() - stats.lastAdAt.getTime();

  if (diff < 60 * 1000) {
    return res.status(429).json({
      message: "Please wait before watching another ad",
      cooldown: Math.ceil((60000 - diff) / 1000),
    });
  }
}

    await AdReward.create({
      userId,
      adRewardId,
      network,
      rewardMinutes: creditedMinutes,
    });

    stats.adsWatched += 1;
    stats.minutesEarned += creditedMinutes;
    await stats.save();

    stats.lastAdAt = new Date();
await stats.save();

    /* ─────────────────────────
       TRANSACTION LOG
    ───────────────────────── */

    await Transaction.create({
      userId,
      type: "EARN",
      amount: creditedMinutes,
      source: "ADS",
      meta: {
        network,
        adRewardId,
      },
    });

    /* ─────────────────────────
       RESPONSE
    ───────────────────────── */

    return res.json({
      success: true,
      creditedMinutes,
    });

  } catch (error) {
    console.error("ADS REWARD ERROR:", error);
    return res.status(500).json({
      message: "Failed to process ad reward",
    });
  }
});

export default router;