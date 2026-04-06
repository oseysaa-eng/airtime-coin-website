import express from "express";
import auth from "../middleware/authMiddleware";

import EmissionState from "../models/EmissionState";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import User from "../models/User";

import { recoverTrust } from "../services/trustRecoveryService";
import { resetDailyIfNeeded } from "../utils/resetDaily";

const router = express.Router();

router.get("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    /* ================= PARALLEL FETCH ================= */
    const [
      user,
      trust,
      settings,
      emission,
      walletRaw,
      recentTx,
    ] = await Promise.all([
      User.findById(userId).lean(),
      recoverTrust(userId),
      SystemSettings.findOne().lean(),
      EmissionState.findOne().lean(),
      Wallet.findOne({ userId }),
      Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ================= WALLET SAFE ================= */
    let wallet = walletRaw;

    if (!wallet) {
      wallet = await Wallet.create({ userId });
    }

    // 🔥 APPLY DAILY RESET
    resetDailyIfNeeded(wallet);
    await wallet.save();

    /* ================= SAFE OBJECTS ================= */
    const safeSettings = settings || {};
    const safeEmission = emission || {};

    /* ================= TRUST ================= */
    let trustStatus: "good" | "reduced" | "limited" | "blocked" = "good";

    if (trust.score < 40) trustStatus = "blocked";
    else if (trust.score < 60) trustStatus = "limited";
    else if (trust.score < 80) trustStatus = "reduced";

    /* ================= WEEKLY ================= */

    const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);

    const weeklyAgg = await Transaction.aggregate([
      {
        $match: {
          userId: wallet.userId,
          type: "EARN",
          createdAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    weeklyAgg.forEach((d: any) => {
      const index = d._id === 1 ? 6 : d._id - 2;
      weeklyMinutes[index] = d.total;
    });

    /* ================= RESPONSE ================= */

    res.json({
      name: user.name || "User",
      profileImage: user.profileImage || null,

      balance: wallet.balanceATC,
      staked: wallet.stakedATC,

      totalMinutes: wallet.totalMinutes,
      todayMinutes: wallet.todayMinutes,

      weeklyMinutes,
      recentTx,

      trustStatus,

      emissionMultiplier: safeEmission.multiplier ?? 1,
      emissionPhase: safeEmission.phase ?? 0,

      beta: {
        active: safeSettings?.beta?.active ?? false,
        conversionEnabled:
          safeSettings?.beta?.showConversion ?? false,
        withdrawalEnabled:
          safeSettings?.beta?.showWithdrawals ?? false,
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