import express from "express";
import adminAuth from "../../middleware/adminAuth";
import CallSession from "../../models/CallSession";
import EmissionState from "../../models/EmissionState";
import RewardPool from "../../models/RewardPool";
import Transaction from "../../models/Transaction";
import User from "../../models/User";
import UserTrust from "../../models/UserTrust";
import Wallet from "../../models/Wallet";



const router = express.Router();

/**
 * 📊 ADMIN OVERVIEW
 * GET /admin/analytics
 */
router.get("/", adminAuth, async (_req, res) => {
  const totalUsers = await User.countDocuments();

  const totalCalls = await CallSession.countDocuments({
    status: "COMPLETED",
  });

  const flaggedCalls = await CallSession.countDocuments({
    flagged: true,
  });

  const minutesAgg = await CallSession.aggregate([
    { $match: { status: "COMPLETED" } },
    { $group: { _id: null, total: { $sum: "$creditedMinutes" } } },
  ]);

  const totalMinutes = minutesAgg[0]?.total || 0;

  const wallets = await Wallet.find();
  const totalATC = wallets.reduce(
    (sum, w) => sum + (w.balanceATC || 0),
    0
  );

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
});


router.get("/burn-rate", adminAuth, async (_req, res) => {
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
        _id: {
          source: "$source",
          day: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
        totalMinutes: { $sum: "$amount" },
      },
    },
    {
      $group: {
        _id: "$_id.source",
        avgDailyMinutes: { $avg: "$totalMinutes" },
        totalMinutes: { $sum: "$totalMinutes" },
      },
    },
  ]);

  const pools = await RewardPool.find();
  const emission = await EmissionState.findOne();

  const emissionMultiplier = emission?.multiplier ?? 1;
  const RATE = 0.0025;

  const result = burns.map(b => {
    const pool = pools.find(p => p.type === b._id);

    const avgDailyATC =
      (b.avgDailyMinutes || 0) * RATE * emissionMultiplier;

    const balanceATC = pool?.balanceATC || 0;

    return {
      type: b._id,
      balanceATC,
      avgDailyATC: Number(avgDailyATC.toFixed(6)),
      totalBurnATC: Number(
        (b.totalMinutes * RATE * emissionMultiplier).toFixed(6)
      ),
      daysLeft:
        avgDailyATC > 0
          ? Math.floor(balanceATC / avgDailyATC)
          : null,
      paused: pool?.paused ?? true,
      dailyLimitATC: pool?.dailyLimitATC ?? 0,
      spentTodayATC: pool?.spentTodayATC ?? 0,
    };
  });

  res.json({
    emission: {
      phase: emission?.phase ?? 0,
      multiplier: emissionMultiplier,
      lastHalvingAt: emission?.lastHalvingAt,
    },
    pools: result,
  });
});

export default router;
