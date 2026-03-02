import express, { Response } from "express";
import mongoose from "mongoose";
import auth from "../middleware/authMiddleware";

import AdReward from "../models/AdReward";
import RewardPool from "../models/RewardPool";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";
import Wallet from "../models/Wallet";
import User from "../models/User";
import { verifyAdSignature } from "../utils/adSignature";

const router = express.Router();

/**
 * POST /api/ads/complete
 */
router.post("/complete", auth, async (req: any, res: Response) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const userId = req.user.id;

    const {
      adRewardId,
      network,
      rewardMinutes,
      signature,
    } = req.body;

    if (!adRewardId || !network || !rewardMinutes)
      return res.status(400).json({
        message: "Missing reward parameters",
      });

    if (!verifyAdSignature(req.body, signature))
      return res.status(403).json({
        message: "Invalid ad signature",
      });

    // Prevent duplicate reward
    const existing = await AdReward.findOne({ adRewardId });
    if (existing) {
      await session.abortTransaction();
      return res.json({
        success: true,
        creditedMinutes: 0,
        duplicate: true,
      });
    }

    // Check system status
    const settings = await SystemSettings.findOne();
    if (settings?.incidentMode?.active)
      return res.status(403).json({
        message: "System temporarily unavailable",
      });

    const pool = await RewardPool.findOne({ type: "ADS" });
    if (!pool || pool.paused)
      return res.status(403).json({
        message: "Ad rewards paused",
      });

    // Trust check
    const trust =
      (await UserTrust.findOne({ userId })) ||
      (await UserTrust.create({ userId }));

    if (trust.score < 40)
      return res.status(403).json({
        message: "Rewards blocked",
      });

    let multiplier = 1;
    if (trust.score < 80) multiplier = 0.75;
    if (trust.score < 60) multiplier = 0.4;

    const creditedMinutes = Math.floor(rewardMinutes * multiplier);

    if (creditedMinutes <= 0)
      return res.json({
        success: true,
        creditedMinutes: 0,
      });

    const today = new Date().toISOString().slice(0, 10);

    let stats = await UserDailyStats.findOne({ userId, date: today });

    if (!stats) {
      stats = await UserDailyStats.create({
        userId,
        date: today,
        adsWatched: 0,
        minutesEarned: 0,
        lastAdAt: null,
      });
    }

    // Cooldown BEFORE credit
    if (stats.lastAdAt) {
      const diff = Date.now() - stats.lastAdAt.getTime();
      if (diff < 60 * 1000)
        return res.status(429).json({
          message: "Please wait before next ad",
        });
    }

    if (stats.adsWatched >= 10)
      return res.status(403).json({
        message: "Daily ad limit reached",
      });

    if (stats.minutesEarned + creditedMinutes > 50)
      return res.status(403).json({
        message: "Daily reward cap reached",
      });

    // Wallet update
    const wallet =
      (await Wallet.findOne({ userId })) ||
      (await Wallet.create({ userId }));

    wallet.totalMinutes += creditedMinutes;
    wallet.todayMinutes += creditedMinutes;
    await wallet.save({ session });

    // Update user summary
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { totalMinutes: creditedMinutes },
      },
      { session }
    );

    // Log reward
    await AdReward.create(
      [
        {
          userId,
          adRewardId,
          network,
          rewardMinutes: creditedMinutes,
        },
      ],
      { session }
    );

    stats.adsWatched += 1;
    stats.minutesEarned += creditedMinutes;
    stats.lastAdAt = new Date();
    await stats.save({ session });

    await Transaction.create(
      [
        {
          userId,
          type: "EARN",
          amount: creditedMinutes,
          source: "ADS",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      creditedMinutes,
    });

  } catch (error) {

    await session.abortTransaction();
    session.endSession();

    console.error("ADS REWARD ERROR:", error);

    return res.status(500).json({
      message: "Failed to process ad reward",
    });

  }

});

export default router;