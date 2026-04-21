import express from "express";
import adminAuth from "../../middleware/adminAuth";

import CallSession from "../../models/CallSession";
import EmissionState from "../../models/EmissionState";
import RewardPool from "../../models/RewardPool";
import Transaction from "../../models/Transaction";
import User from "../../models/User";
import UserTrust from "../../models/UserTrust";
import Wallet from "../../models/Wallet";
import SystemWallet from "../../models/SystemWallet";


const router = express.Router();

/* =====================================================
   📊 MAIN OVERVIEW
===================================================== */
router.get("/", adminAuth, async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalCalls = await CallSession.countDocuments({
      status: "completed",
    });

    const flaggedCalls = await CallSession.countDocuments({
      flagged: true,
    });

    /* ---------- TOTAL MINUTES ---------- */
    const minutesAgg = await CallSession.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$minutes" } } },
    ]);

    const totalMinutes = minutesAgg[0]?.total || 0;

    /* ---------- TOTAL ATC ---------- */
    const wallets = await Wallet.find();

    const totalATC = wallets.reduce(
      (sum, w) => sum + (w.balanceATC || 0),
      0
    );

    /* ---------- TRUST DISTRIBUTION ---------- */
    const trustAgg = await UserTrust.aggregate([
      {
        $bucket: {
          groupBy: "$score",
          boundaries: [0, 40, 60, 80, 101],
          default: "unknown",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    res.json({
      users: totalUsers,
      calls: totalCalls,
      minutes: totalMinutes,
      atcMinted: Number(totalATC.toFixed(4)),
      flaggedCalls,
      trustDistribution: trustAgg,
    });

  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
});

/* =====================================================
   🔥 BURN RATE (UPDATED FOR MINUTES SYSTEM)
===================================================== */
router.get("/burn", adminAuth, async (_req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const burns = await Transaction.aggregate([
      {
        $match: {
          type: "EARN",
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: "$source",
          totalMinutes: { $sum: "$amount" },
        },
      },
    ]);

    const pools = await RewardPool.find();
    const emission = await EmissionState.findOne();

    const multiplier = emission?.multiplier ?? 1;

    const result = burns.map((b) => {
      const pool = pools.find((p) => p.type === b._id);

      const avgDailyMinutes = b.totalMinutes / 30;

      const avgDailyATC = avgDailyMinutes * multiplier;

      const balanceATC = pool?.balanceATC || 0;

      return {
        type: b._id,
        balanceATC,
        avgDailyMinutes,
        avgDailyATC,
        daysLeft:
          avgDailyATC > 0
            ? Math.floor(balanceATC / avgDailyATC)
            : null,
        paused: pool?.paused ?? true,
      };
    });

    res.json({ burnRate: result });

  } catch (err) {
    console.error("Burn rate error:", err);
    res.status(500).json({ message: "Failed burn analytics" });
  }
});

/* ================= PROFIT SUMMARY ================= */
  router.get("/profit", adminAuth, async (_req, res) => {
  try {
    const wallet = await SystemWallet.findOne();

    if (!wallet) {
      return res.json({
        totalProfitATC: 0,
        dailyProfitATC: 0,
        totalConversions: 0,
        breakdown: {
          conversion: 0,
          calls: 0,
          ads: 0,
        },
      });
    }

    res.json({
      totalProfitATC: wallet.totalProfitATC || 0,
      dailyProfitATC: wallet.dailyProfitATC || 0,
      totalConversions: wallet.totalConversions || 0,
      breakdown: {
        conversion: wallet.profitFromConversion || 0,
        calls: wallet.profitFromCalls || 0,
        ads: wallet.profitFromAds || 0,
      },
    });
  } catch (err) {
    console.error("❌ PROFIT API ERROR:", err);
    res.status(500).json({ message: "Failed to load profit" });
  }
});

router.get("/profit-trend", adminAuth, async (_req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          type: "CONVERT",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          profit: { $sum: "$meta.profitATC" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      trend: data.map(d => ({
        date: d._id,
        profit: d.profit,
      })),
    });
  } catch {
    res.status(500).json({ message: "Trend failed" });
  }
});

/* =====================================================
   📈 SIMPLE OVERVIEW (CLEANED)
===================================================== */
router.get("/overview", adminAuth, async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalCalls = await CallSession.countDocuments();

    const totalMinutesAgg = await CallSession.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$minutes" } } },
    ]);

    const totalMinutes = totalMinutesAgg[0]?.total || 0;

    const riskyUsers = await UserTrust.countDocuments({
      score: { $lte: 40 },
    });

    res.json({
      totalUsers,
      totalCalls,
      totalMinutes,
      riskyUsers,
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed" });
  }
});

router.get("/top-callers", adminAuth, async (_req, res) => {
  const top = await CallSession.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: "$userId",
        totalMinutes: { $sum: "$minutes" },
        totalCalls: { $sum: 1 },
      },
    },
    { $sort: { totalMinutes: -1 } },
    { $limit: 10 },
  ]);

  res.json(top);
});

// call trend
router.get("/call-trend", async (req, res) => {
  const data = await CallSession.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        calls: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data.map(d => ({
    date: d._id,
    calls: d.calls,
  })));
});

// fraud heatmap
router.get("/fraud-heatmap", async (req, res) => {
  const data = await CallSession.aggregate([
    { $match: { flagged: true } },
    {
      $project: {
        hour: { $hour: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$hour",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data.map(d => ({
    hour: d._id,
    count: d.count,
  })));
});

export default router;