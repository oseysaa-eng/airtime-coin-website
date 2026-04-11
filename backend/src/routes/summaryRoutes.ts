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

    /* ================= PARALLEL (FAST) ================= */
    const [
      user,
      settings,
      emission,
      walletRaw,
      recentTx,
    ] = await Promise.all([
      User.findById(userId).lean(),
      SystemSettings.findOne().lean(),
      EmissionState.findOne().lean(),
      Wallet.findOne({ userId }).lean(), // ✅ lean
      Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("type amount source createdAt")
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

    /* ================= DAILY RESET (NO SAVE BLOCK) ================= */
    if (wallet.lastDailyReset) {
      const now = new Date();
      const last = new Date(wallet.lastDailyReset);

      if (now.toDateString() !== last.toDateString()) {
        // ⚡ async update (DO NOT BLOCK RESPONSE)
        Wallet.updateOne(
          { userId },
          {
            todayMinutes: 0,
            dailyEarned: { ads: 0, calls: 0, surveys: 0 },
            lastDailyReset: now,
          }
        ).catch(() => {});
        
        wallet.todayMinutes = 0;
      }
    }

    /* ================= WEEKLY (ULTRA FAST) ================= */

    const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0];

    // 🔥 Instead of aggregation → use recentTx (lightweight fallback)
    recentTx.forEach((tx: any) => {
      if (tx.type !== "EARN") return;

      const day = new Date(tx.createdAt).getDay();
      const index = day === 0 ? 6 : day - 1;

      weeklyMinutes[index] += tx.amount || 0;
    });

    /* ================= RESPONSE ================= */

    res.json({
      name: user.name || "User",
      profileImage: user.profileImage || null,

      balance: wallet.balanceATC || 0,
      staked: wallet.stakedATC || 0,

      totalMinutes: wallet.totalMinutes || 0,
      todayMinutes: wallet.todayMinutes || 0,

      weeklyMinutes,
      recentTx,

      trustStatus: "good", // ⚡ simplified for speed

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