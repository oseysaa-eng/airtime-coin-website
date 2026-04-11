import express from "express";
import auth from "../middleware/authMiddleware";

import AdReward from "../models/AdReward";
import RewardPool from "../models/RewardPool";
import SystemSettings from "../models/SystemSettings";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";

import { verifyAdSignature } from "../utils/adSignature";
import { rewardEngine } from "../services/rewardEngine";
import { getDynamicReward } from "../services/miningDifficulty";
import { addMinedMinutes } from "../services/emissionTracker";

const router = express.Router();

/* ================= DATE HELPER ================= */
const todayStr = () => new Date().toISOString().slice(0, 10);

/* ================= ROUTE ================= */
router.post("/complete", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { adRewardId, network, signature } = req.body;

    if (!adRewardId) {
      return res.status(400).json({ message: "Missing adRewardId" });
    }

    /* ================= 🔐 SIGNATURE CHECK ================= */
    if (signature && !verifyAdSignature(signature, adRewardId)) {
      return res.status(403).json({ message: "Invalid signature" });
    }

    /* ================= 🚀 ATOMIC DUPLICATE CHECK ================= */
    const existing = await AdReward.findOne({ adRewardId }).lean();
    if (existing) {
      return res.json({
        success: true,
        creditedMinutes: 0,
        duplicate: true,
      });
    }

    /* ================= PARALLEL FETCH ================= */
    const [settings, poolDoc, trust, stats] = await Promise.all([
      SystemSettings.findOne().lean(),
      RewardPool.findOne({ type: "ADS" }), // 🔥 NOT lean (we may update)
      UserTrust.findOne({ userId }).lean(),
      UserDailyStats.findOne({
        userId,
        date: todayStr(),
      }).lean(),
    ]);

    /* ================= INCIDENT MODE ================= */
    if (settings?.incidentMode?.active) {
      return res.status(403).json({ message: "System unavailable" });
    }

    /* ================= TRUST ================= */
    const trustScore = trust?.score ?? 100;

    if (trustScore < 40) {
      return res.status(403).json({ message: "Trust blocked" });
    }

    let multiplier = 1;
    if (trustScore < 80) multiplier = 0.75;
    if (trustScore < 60) multiplier = 0.4;

    /* ================= REWARD ================= */
    const baseReward = await getDynamicReward();
    const creditedMinutes = Math.floor(baseReward * multiplier);

    if (creditedMinutes <= 0) {
      return res.json({ success: true, creditedMinutes: 0 });
    }

    /* ================= LIMITS ================= */
    if (stats?.adsWatched >= 10) {
      return res.status(403).json({ message: "Daily limit reached" });
    }

    if (stats?.lastAdAt) {
      const diff = Date.now() - new Date(stats.lastAdAt).getTime();
      if (diff < 60000) {
        return res.status(429).json({ message: "Wait before next ad" });
      }
    }

    /* ================= POOL CHECK ================= */
    if (poolDoc) {
      const now = new Date();
      const last = new Date(poolDoc.lastReset);

      // 🔥 Reset daily pool
      if (now.toDateString() !== last.toDateString()) {
        poolDoc.spentTodayATC = 0;
        poolDoc.lastReset = now;
      }

      if (
        poolDoc.spentTodayATC + creditedMinutes >
        poolDoc.dailyLimitATC
      ) {
        return res.status(403).json({ message: "Budget exhausted" });
      }
    }

    /* ================= 🚀 INSTANT RESPONSE ================= */
    res.json({
      success: true,
      creditedMinutes,
    });

    /* ================= 🔥 BACKGROUND PROCESS ================= */
    (async () => {
      try {
        const io = req.app.get("io");

        await rewardEngine({
          userId,
          minutes: creditedMinutes,
          source: "ADS",
          meta: { network, adRewardId },
          io,
        });

        await addMinedMinutes(creditedMinutes);

        await Promise.all([
          /* UPDATE STATS */
          UserDailyStats.updateOne(
            { userId, date: todayStr() },
            {
              $inc: {
                adsWatched: 1,
                minutesEarned: creditedMinutes,
              },
              $set: { lastAdAt: new Date() },
            },
            { upsert: true }
          ),

          /* UPDATE POOL */
          poolDoc
            ? poolDoc.updateOne({
                $inc: { spentTodayATC: creditedMinutes },
              })
            : Promise.resolve(),

          /* LOG REWARD (FINAL DUPLICATE GUARD) */
          AdReward.create({
            userId,
            adRewardId,
            network,
            rewardMinutes: creditedMinutes,
          }),
        ]);
      } catch (err) {
        console.error("⚠️ Background ad processing error:", err);
      }
    })();

  } catch (err) {
    console.error("ADS ERROR:", err);

    res.status(500).json({
      message: "Ad reward failed",
    });
  }
});

export default router;