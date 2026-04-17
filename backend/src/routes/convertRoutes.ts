import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/authMiddleware";

import ConversionPool from "../models/ConversionPool";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import UserTrust from "../models/UserTrust";
import Wallet from "../models/Wallet";

import { resetIfNewDay } from "../utils/resetDailyCounter";
import { getDynamicRate, runEmissionHalvingIfNeeded } from "../services/emissionEngine";

const router = express.Router();

router.post("/", auth, async (req: any, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { minutes } = req.body;

    if (!minutes || minutes <= 0) {
      throw new Error("Invalid minutes");
    }

    /* ================= SETTINGS ================= */
    const settings = await SystemSettings.findOne().session(session);

    if (settings?.beta?.active && !settings.beta.showConversion) {
      throw new Error("Conversion disabled in beta");
    }

    /* ================= WALLET ================= */
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { new: true, upsert: true, session }
    );

    /* DAILY RESET */
    if (
      !wallet.lastConversionReset ||
      new Date().toDateString() !== wallet.lastConversionReset.toDateString()
    ) {
      wallet.convertedTodayMinutes = 0;
      wallet.lastConversionReset = new Date();
    }

    if (wallet.totalMinutes < minutes) {
      throw new Error("Insufficient minutes");
    }

    /* ================= TRUST ================= */
    const trust = await UserTrust.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, score: 100 } },
      { new: true, upsert: true, session }
    );

    if (trust.score < 40) {
      throw new Error("Trust blocked");
    }

    /* ================= LIMIT ================= */
    let maxMinutes = 300;

    if (trust.score < 80) maxMinutes = 150;
    if (trust.score < 60) maxMinutes = 50;

    if (settings?.beta?.active) {
      maxMinutes = Math.min(maxMinutes, settings.beta.maxConvertMinutes || 50);
    }

    if (wallet.convertedTodayMinutes + minutes > maxMinutes) {
      throw new Error("Daily limit reached");
    }

    /* ================= POOL ================= */
    const pool = await ConversionPool.findOneAndUpdate(
      { source: "AIRTIME" },
      {
        $setOnInsert: {
          source: "AIRTIME",
          balanceATC: 1000000,
          rate: 0.0025,
          dailyLimitATC: 50000,
          spentTodayATC: 0,
          paused: false,
        },
      },
      { new: true, upsert: true, session }
    );

    await resetIfNewDay(pool);

    if (pool.paused) {
      throw new Error("Pool paused");
    }

    /* ================= EMISSION ================= */
    await runEmissionHalvingIfNeeded();

    const rate = await getDynamicRate();

    let atcAmount = Number((minutes * rate).toFixed(6));

    if (atcAmount <= 0) {
      throw new Error("Too small");
    }

    /* ================= TREASURY PROTECTION ================= */
    if (pool.spentTodayATC + atcAmount > pool.dailyLimitATC) {
      throw new Error("Daily pool exhausted");
    }

    if (pool.balanceATC < atcAmount) {
      // 🔥 AUTO SCALE instead of reject
      const scaledATC = pool.balanceATC * 0.9;

      atcAmount = scaledATC;
    }

    /* ================= APPLY ================= */

    wallet.totalMinutes -= minutes;
    wallet.balanceATC += atcAmount;
    wallet.convertedTodayMinutes += minutes;
    wallet.lastConversionAt = new Date();

    await wallet.save({ session });

    pool.balanceATC -= atcAmount;
    pool.spentTodayATC += atcAmount;

    if (pool.balanceATC < pool.dailyLimitATC * 2) {
      pool.paused = true;
    }

    await pool.save({ session });

    /* ================= TRANSACTION ================= */

    await Transaction.create(
      [
        {
          userId,
          type: "CONVERT",
          amount: atcAmount,
          source: "MINUTES",
          meta: {
            minutes,
            rate,
            trustScore: trust.score,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      minutesConverted: minutes,
      atcReceived: atcAmount,
      rate,
      remainingDailyMinutes: maxMinutes - wallet.convertedTodayMinutes,
    });

  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ CONVERT ERROR:", err.message);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;