import express from "express";
import auth from "../middleware/authMiddleware";

import AdReward from "../models/AdReward";
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

    /* ================= 🚨 HARD DUPLICATE LOCK ================= */
    try {
      await AdReward.create({
        userId,
        adRewardId,
        network,
        rewardMinutes: 0, // temp placeholder
      });
    } catch {
      // 🔥 Already exists → duplicate
      return res.json({
        success: true,
        creditedMinutes: 0,
        duplicate: true,
      });
    }

    /* ================= PARALLEL FETCH ================= */
    const [settings, trust, stats] = await Promise.all([
      SystemSettings.findOne().lean(),
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

    /* ================= 🚀 INSTANT RESPONSE ================= */
    res.json({
      success: true,
      creditedMinutes,
    });

    /* ================= 🔥 BACKGROUND PROCESS ================= */
    (async () => {
      try {
        /* ================= REWARD ENGINE ================= */
        const result = await rewardEngine({
          userId,
          minutes: creditedMinutes,
          source: "ADS",
          meta: { network, adRewardId },
        });

        await addMinedMinutes(creditedMinutes);

        /* ================= UPDATE STATS ================= */
        await UserDailyStats.updateOne(
          { userId, date: todayStr() },
          {
            $inc: {
              adsWatched: 1,
              minutesEarned: creditedMinutes,
            },
            $set: { lastAdAt: new Date() },
          },
          { upsert: true }
        );

        /* ================= FINALIZE REWARD RECORD ================= */
        await AdReward.updateOne(
          { adRewardId },
          {
            $set: {
              rewardMinutes: creditedMinutes,
              rewardATC: result.creditedATC,
            },
          }
        );

      } catch (err) {
        console.error("⚠️ Background ad processing error:", err);

        /* 🔥 ROLLBACK MARK (optional) */
        await AdReward.updateOne(
          { adRewardId },
          { $set: { failed: true } }
        );
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