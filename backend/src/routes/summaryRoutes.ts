import express from "express";
import auth from "../middleware/authMiddleware";

import EmissionState from "../models/EmissionState";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import User from "../models/User";
import UserTrust from "../models/UserTrust";

const router = express.Router();

router.get("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    /* ================= PARALLEL ================= */
    const [user, settings, emission, walletRaw, trust] =
      await Promise.all([
        User.findById(userId).lean(),
        SystemSettings.findOne().lean(),
        EmissionState.findOne().lean(),
        Wallet.findOne({ userId }).lean(),
        UserTrust.findOne({ userId }).lean(),
      ]);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ================= WALLET SAFE (ATOMIC) ================= */
    const wallet = walletRaw
      ? walletRaw
      : await Wallet.findOneAndUpdate(
          { userId },
          { $setOnInsert: { userId } },
          { upsert: true, new: true }
        ).lean();

    /* ================= DAILY RESET ================= */
    let todayMinutes = wallet.todayMinutes || 0;

    if (wallet.lastDailyReset) {
      const now = new Date();
      const last = new Date(wallet.lastDailyReset);

      if (now.toDateString() !== last.toDateString()) {
        todayMinutes = 0;

        // 🔥 async safe reset
        Wallet.updateOne(
          { userId },
          {
            todayMinutes: 0,
            dailyEarned: { ads: 0, calls: 0, surveys: 0 },
            lastDailyReset: now,
          }
        ).catch(() => {});
      }
    }

    /* ================= WEEKLY (IMPROVED) ================= */

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyData = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "EARN",
          createdAt: { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];

    weeklyData.forEach((d: any) => {
      const index = d._id === 1 ? 6 : d._id - 2;
      weeklyMinutes[index] = d.total;
    });

    /* ================= RECENT ================= */

    const recentTx = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("type amount source createdAt")
      .lean();

    /* ================= TRUST ================= */

    const trustScore = trust?.score ?? 100;

    let trustStatus = "excellent";
    if (trustScore < 80) trustStatus = "good";
    if (trustScore < 60) trustStatus = "warning";
    if (trustScore < 40) trustStatus = "blocked";

    /* ================= RESPONSE ================= */

    res.json({
      name: user.name || "User",
      profileImage: user.profileImage || null,

      balance: wallet.balanceATC || 0,
      staked: wallet.stakedATC || 0,

      totalMinutes: wallet.totalMinutes || 0,
      todayMinutes,

      weeklyMinutes,
      recentTx,

      trustStatus,
      trustScore,

      emissionMultiplier: emission?.multiplier ?? 1,
      emissionPhase: emission?.phase ?? 0,

      beta: {
        active: settings?.beta?.active ?? false,
        conversionEnabled:
          settings?.beta?.showConversion ?? false,
        withdrawalEnabled:
          settings?.beta?.showWithdrawals ?? false,
      },
    });

  } catch (err) {
    console.error("SUMMARY ERROR:", err);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
});

export default router;