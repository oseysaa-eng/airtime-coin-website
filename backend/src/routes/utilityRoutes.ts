import express from "express";
import auth from "../middleware/authMiddleware";
import verifyPin from "../middleware/verifyPin";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import Treasury from "../models/Treasury";
import UserTrust from "../models/UserTrust";
import UtilityPool from "../models/UtilityPool";
import UtilityPricing from "../models/UtilityPricing";
import Wallet from "../models/Wallet";

import { sendAirtime } from "../services/utility/airtimeProvider";
import { sendData } from "../services/utility/dataProvider";
import { payDSTV } from "../services/utility/dstvProvider";

const router = express.Router();

/**
 * POST /api/utility/purchase
 */

router.post("/purchase", auth, verifyPin, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { utility, amountATC, phone, network, accountId } = req.body;

    if (!utility || !amountATC || amountATC <= 0) {
      return res.status(400).json({ message: "Invalid parameters" });
    }

    // ───────────────────────── SYSTEM CHECK
    const settings = await SystemSettings.findOne();
    if (settings?.incidentMode?.active) {
      return res.status(403).json({
        message: "Utility purchases temporarily disabled",
      });
    }

    // ───────────────────────── TRUST
    const trust =
      (await UserTrust.findOne({ userId })) ||
      (await UserTrust.create({ userId }));

    if (trust.score < 40) {
      return res.status(403).json({
        message: "Utility access blocked due to trust score",
      });
    }

    // ───────────────────────── WALLET
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balanceATC < amountATC) {
      return res.status(400).json({ message: "Insufficient ATC" });
    }

    // ───────────────────────── POOL
    const pool = await UtilityPool.findOne({ utility });
    if (!pool || pool.paused) {
      return res.status(403).json({
        message: `${utility} service unavailable`,
      });
    }

    if (pool.spentTodayATC + amountATC > pool.dailyLimitATC) {
      return res.status(403).json({
        message: "Daily utility limit reached",
      });
    }

    // ───────────────────────── PRICING ENGINE
    const pricing =
      (await UtilityPricing.findOne()) ||
      (await UtilityPricing.create({}));

    const rate = pricing.currentRate;

    // ───────────────────────── CALL PROVIDER
    let result;
    switch (utility) {
      case "AIRTIME":
        result = await sendAirtime({ phone, amountATC, rate });
        break;
      case "DATA":
        result = await sendData({ phone, network, amountATC, rate });
        break;
      case "DSTV":
        result = await payDSTV({ accountId, amountATC, rate });
        break;
      default:
        return res.status(400).json({ message: "Unsupported utility" });
    }

    if (!result?.success) {
      return res.status(500).json({ message: "Provider failed" });
    }

    // ───────────────────────── FEE SPLIT
    const treasury =
      (await Treasury.findOne()) || (await Treasury.create({}));

    const burnPct = settings?.utilityFees?.burnPercent || 0;
    const treasuryPct = settings?.utilityFees?.treasuryPercent || 0;

    if (burnPct + treasuryPct > 100) {
      return res.status(500).json({
        message: "Invalid fee configuration",
      });
    }

    const burnATC = +(amountATC * burnPct / 100).toFixed(6);
    const treasuryATC = +(amountATC * treasuryPct / 100).toFixed(6);
    const poolATC = +(amountATC - burnATC - treasuryATC).toFixed(6);

    // ───────────────────────── APPLY MOVEMENT

    // 🔥 Burn
    treasury.totalBurnedATC += burnATC;

    // 🏦 Treasury
    treasury.balanceATC += treasuryATC;
    await treasury.save();

    // ⚙ Pool usage
    if (pool.balanceATC < poolATC) {
      return res.status(403).json({
        message: "Utility pool depleted",
      });
    }

    pool.balanceATC -= poolATC;
    pool.spentTodayATC += poolATC;
    await pool.save();

    // 💳 Wallet
    wallet.balanceATC -= amountATC;
    await wallet.save();

    // ───────────────────────── TRANSACTION
    await Transaction.create({
      userId,
      type: "UTILITY",
      amount: amountATC,
      source: utility,
      status: "SUCCESS",
      meta: {
        utilityValue: result.value,
        rateUsed: rate,
        burn: burnATC,
        treasury: treasuryATC,
        pool: poolATC,
        reference: result.meta?.reference,
      },
    });

    res.json({
      success: true,
      utility,
      atcSpent: amountATC,
      utilityValue: result.value,
      rate,
      breakdown: {
        burn: burnATC,
        treasury: treasuryATC,
        pool: poolATC,
      },
    });
  } catch (err) {
    console.error("UTILITY ERROR:", err);
    res.status(500).json({ message: "Utility processing failed" });
  }
});

export default router;