import express from "express";
import auth from "../middleware/authMiddleware";

import EmissionState from "../models/EmissionState";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import User from "../models/User";

import { recoverTrust } from "../services/trustRecoveryService";

const router = express.Router();

router.get("/", auth, async (req: any, res) => {

  try {

    const userId = req.user.id;

    /* USER */
    const user = await User.findById(userId);

    /* TRUST */

    const trust = await recoverTrust(userId);

    let trustStatus: "good" | "reduced" | "limited" | "blocked" = "good";

    if (trust.score < 80) trustStatus = "reduced";
    if (trust.score < 60) trustStatus = "limited";
    if (trust.score < 40) trustStatus = "blocked";

    /* SYSTEM SETTINGS */

    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    /* EMISSION */

    const emission =
      (await EmissionState.findOne()) ||
      (await EmissionState.create({}));

    /* WALLET */

    const wallet =
      (await Wallet.findOne({ userId })) ||
      (await Wallet.create({ userId }));

    /* TRANSACTIONS */

    const recentTx = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    /* WEEKLY CHART */

    const weeklyMinutes = [0,0,0,0,0,0,0];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);

    const earned = await Transaction.find({
      userId,
      type: "EARN",
      createdAt: { $gte: weekAgo },
    });

    earned.forEach(tx => {

      const jsDay = new Date(tx.createdAt).getDay();

      const index = jsDay === 0 ? 6 : jsDay - 1;

      weeklyMinutes[index] += tx.amount || 0;

    });

    /* RESPONSE */

    res.json({

      name: user?.name || "User",
      profileImage: user?.profileImage || null,

      balance: wallet.balanceATC || 0,
      staked: wallet.stakedATC || 0,

      totalMinutes: wallet.totalMinutes || 0,
      todayMinutes: wallet.todayMinutes || 0,

      weeklyMinutes,
      recentTx,

      trustStatus,

      emissionMultiplier: emission.multiplier ?? 1,
      emissionPhase: emission.phase ?? 0,

      beta: {
        active: settings.beta?.active ?? false,
        conversionEnabled: settings.beta?.showConversion ?? false,
        withdrawalEnabled: settings.beta?.showWithdrawals ?? false,
      }

    });

  } catch (err) {

    console.error("SUMMARY ERROR:", err);

    res.status(500).json({
      message: "Failed to load dashboard"
    });

  }

});

export default router;