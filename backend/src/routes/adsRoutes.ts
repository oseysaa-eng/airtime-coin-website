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

/* ----------------------------------
   DAILY POOL RESET
---------------------------------- */
function resetDailyPool(pool: any) {
  const now = new Date();
  const last = new Date(pool.lastReset);

  if (
    now.getUTCDate() !== last.getUTCDate() ||
    now.getUTCMonth() !== last.getUTCMonth() ||
    now.getUTCFullYear() !== last.getUTCFullYear()
  ) {
    pool.spentTodayATC = 0;
    pool.lastReset = now;
  }
}

/* ==================================
   POST /api/ads/complete
================================== */
router.post("/complete", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { adRewardId, network, signature } = req.body;

    /* ================= VALIDATION ================= */
    if (!adRewardId || !network) {
      return res.status(400).json({ message: "Invalid request" });
    }

    /* ================= SIGNATURE VERIFY ================= */
    const isValid = verifyAdSignature({
      adRewardId,
      network,
      signature,
    });

    if (!isValid) {
      return res.status(403).json({ message: "Invalid ad verification" });
    }

    /* ================= ATOMIC LOCK ================= */
    const lock = await AdReward.findOneAndUpdate(
      { adRewardId },
      {
        $setOnInsert: {
          userId,
          adRewardId,
          network,
          status: "processing",
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    if (lock.status !== "processing") {
      return res.json({
        success: true,
        creditedMinutes: 0,
        duplicate: true,
      });
    }

    /* ================= FETCH DATA ================= */
    const [settings, pool, trust, stats] = await Promise.all([
      SystemSettings.findOne(),
      RewardPool.findOne({ type: "ADS" }),
      UserTrust.findOne({ userId }),
      UserDailyStats.findOne({
        userId,
        date: new Date().toISOString().slice(0, 10),
      }),
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

    if (pool) {
      resetDailyPool(pool);

      if (
        pool.spentTodayATC + creditedMinutes >
        pool.dailyLimitATC
      ) {
        return res.status(403).json({ message: "Budget exhausted" });
      }
    }

    /* ================= RESPONSE FAST ================= */
    res.json({
      success: true,
      creditedMinutes,
    });

    /* ================= BACKGROUND ================= */
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
          UserDailyStats.updateOne(
            { userId, date: new Date().toISOString().slice(0, 10) },
            {
              $inc: {
                adsWatched: 1,
                minutesEarned: creditedMinutes,
              },
              $set: { lastAdAt: new Date() },
            },
            { upsert: true }
          ),

          RewardPool.updateOne(
            { type: "ADS" },
            { $inc: { spentTodayATC: creditedMinutes } }
          ),

          AdReward.updateOne(
            { adRewardId },
            {
              $set: {
                status: "completed",
                rewardMinutes: creditedMinutes,
              },
            }
          ),
        ]);
      } catch (err) {
        console.error("⚠️ Background error:", err);

        await AdReward.updateOne(
          { adRewardId },
          { $set: { status: "failed" } }
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