import express from "express";
import auth from "../middleware/authMiddleware";
import EmissionState from "../models/EmissionState";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import { recoverTrust } from "../services/trustRecoveryService";

const router = express.Router();

router.get("/", auth, async (req: any, res) => {
  try {
    const uid = req.user.id;

    /* ───────────────── TRUST ───────────────── */
    const trust = await recoverTrust(uid);

    let trustStatus: "good" | "reduced" | "limited" | "blocked" = "good";
    if (trust.score < 80) trustStatus = "reduced";
    if (trust.score < 60) trustStatus = "limited";
    if (trust.score < 40) trustStatus = "blocked";

    /* ───────────────── SYSTEM SETTINGS ───────────────── */
    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    /* ───────────────── EMISSION ───────────────── */
    const emission =
      (await EmissionState.findOne()) ||
      (await EmissionState.create({}));

    /* ───────────────── WALLET ───────────────── */
    const wallet =
      (await Wallet.findOne({ userId: uid })) ||
      (await Wallet.create({ userId: uid }));

    /* ───────────────── TRANSACTIONS ───────────────── */
    const recentTx = await Transaction.find({ userId: uid })
      .sort({ createdAt: -1 })
      .limit(5);

    /* ───────────────── WEEKLY CHART (MON–SUN) ───────────────── */
    const weeklyMinutes = [0, 0, 0, 0, 0, 0, 0]; // Mon → Sun
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);

    const earned = await Transaction.find({
      userId: uid,
      type: "EARN",
      createdAt: { $gte: weekAgo },
    });

    earned.forEach(tx => {
      const jsDay = new Date(tx.createdAt).getDay(); // 0=Sun
      const index = jsDay === 0 ? 6 : jsDay - 1; // convert to Mon=0
      weeklyMinutes[index] += tx.amount || 0;
    });

    /* ───────────────── RESPONSE ───────────────── */
    res.json({
      name: "User",
      balance: wallet.balanceATC || 0,
      staked: wallet.stakedATC || 0,
      totalMinutes: wallet.totalMinutes || 0,
      todayMinutes: wallet.todayMinutes || 0,
      weeklyMinutes,
      recentTx,

      trustStatus,
      earlyAdopter: settings.beta?.active === true,

      emissionMultiplier: emission.multiplier ?? 1,
      emissionPhase: emission.phase ?? 0,

      beta: {
        active: settings.beta?.active ?? false,
        conversionEnabled: settings.beta?.showConversion ?? false,
        withdrawalEnabled: settings.beta?.showWithdrawals ?? false,
      },
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
});

export default router;


