import express from "express";
import auth from "../middleware/authMiddleware";

import AdReward from "../models/AdReward";
import RewardPool from "../models/RewardPool";
import SystemSettings from "../models/SystemSettings";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";

import { verifyAdSignature } from "../utils/adSignature";
import { rewardEngine } from "../services/rewardEngine";

const router = express.Router();

/*
  POST /api/ads/complete
  Reward user after watching ad
*/

router.post("/complete", auth, async (req: any, res) => {

  try {

    const userId = req.user.id;

    const {
      adRewardId,
      network,
      signature
    } = req.body;

    if (!adRewardId)
      return res.status(400).json({
        message: "Missing adRewardId"
      });

    /* ---------------------------
       BETA: signature disabled
    --------------------------- */

    if (signature && !verifyAdSignature(req.body, signature)) {
      console.log("⚠️ Invalid ad signature (ignored in beta)");
    }

    /* ---------------------------
       DUPLICATE PROTECTION
    --------------------------- */

    const duplicate = await AdReward.findOne({ adRewardId });

    if (duplicate)
      return res.json({
        success: true,
        creditedMinutes: 0,
        duplicate: true
      });

    /* ---------------------------
       SYSTEM INCIDENT MODE
    --------------------------- */

    const settings = await SystemSettings.findOne();

    if (settings?.incidentMode?.active)
      return res.status(403).json({
        message: "System temporarily unavailable"
      });

    /* ---------------------------
       REWARD POOL
    --------------------------- */

    let pool = await RewardPool.findOne({ type: "ADS" });

    if (!pool) {
      pool = await RewardPool.create({
        type: "ADS",
        paused: false
      });
    }

    if (pool.paused)
      return res.status(403).json({
        message: "Ads paused"
      });

    /* ---------------------------
       TRUST CHECK
    --------------------------- */

    const trust =
      (await UserTrust.findOne({ userId })) ||
      (await UserTrust.create({ userId }));

    if (trust.score < 40)
      return res.status(403).json({
        message: "Trust blocked"
      });

    /* ---------------------------
       TRUST MULTIPLIER
    --------------------------- */

    let multiplier = 1;

    if (trust.score < 80) multiplier = 0.75;
    if (trust.score < 60) multiplier = 0.4;

    /* ---------------------------
       SERVER CONTROLLED REWARD
    --------------------------- */

    const REWARD_MINUTES = 5;

    const creditedMinutes =
      Math.floor(REWARD_MINUTES * multiplier);

    if (creditedMinutes <= 0)
      return res.json({
        success: true,
        creditedMinutes: 0
      });

    /* ---------------------------
       DAILY STATS
    --------------------------- */

    const today = new Date().toISOString().slice(0, 10);

    let stats =
      await UserDailyStats.findOne({ userId, date: today });

    if (!stats) {
      stats = await UserDailyStats.create({
        userId,
        date: today,
        adsWatched: 0,
        minutesEarned: 0,
        lastAdAt: null
      });
    }

    /* ---------------------------
       AD COOLDOWN (60s)
    --------------------------- */

    if (stats.lastAdAt) {

      const diff = Date.now() - stats.lastAdAt.getTime();

      if (diff < 60 * 1000)
        return res.status(429).json({
          message: "Please wait before next ad"
        });

    }

    /* ---------------------------
       DAILY LIMIT
    --------------------------- */

    if (stats.adsWatched >= 10)
      return res.status(403).json({
        message: "Daily ad limit reached"
      });

    /* ---------------------------
       REWARD ENGINE
    --------------------------- */

    const io = req.app.get("io");

    await rewardEngine({
      userId,
      minutes: creditedMinutes,
      source: "ADS",
      meta: { network, adRewardId },
      io
    });

    /* ---------------------------
       UPDATE STATS
    --------------------------- */

    stats.adsWatched += 1;
    stats.minutesEarned += creditedMinutes;
    stats.lastAdAt = new Date();

    await stats.save();

    /* ---------------------------
       LOG REWARD
    --------------------------- */

    await AdReward.create({
      userId,
      adRewardId,
      network,
      rewardMinutes: creditedMinutes
    });

    /* ---------------------------
       SUCCESS
    --------------------------- */

    res.json({
      success: true,
      creditedMinutes
    });

  } catch (err) {

    console.error("ADS REWARD ERROR:", err);

    res.status(500).json({
      message: "Ad reward failed"
    });

  }

});

export default router;