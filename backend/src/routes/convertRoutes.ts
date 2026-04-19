import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/authMiddleware";

import ConversionPool from "../models/ConversionPool";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import UserTrust from "../models/UserTrust";
import Wallet from "../models/Wallet";
import SystemWallet from "../models/SystemWallet";

import { resetIfNewDay } from "../utils/resetDailyCounter";
import { getDynamicRate, runEmissionHalvingIfNeeded } from "../services/emissionEngine";
import { emitAdminEvent } from "../sockets/socket";
import { resetProfitIfNewDay } from "../utils/resetDaily"; // 🔥 add this

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

    const PROFIT_PERCENT = 0.1;

    let grossATC = minutes * rate;

    if (grossATC <= 0) {
      throw new Error("Too small");
    }

    /* ================= TREASURY ================= */
    if (pool.spentTodayATC + grossATC > pool.dailyLimitATC) {
      throw new Error("Daily pool exhausted");
    }

    if (pool.balanceATC < grossATC) {
      console.warn("⚠️ Pool low → scaling");
      grossATC = pool.balanceATC * 0.9;
    }

    /* ================= CALCULATIONS ================= */
    const userATC = Number((grossATC * 0.9).toFixed(6));
    const profitATC = Number((grossATC * 0.1).toFixed(6));

    /* ================= APPLY ================= */
    wallet.totalMinutes -= minutes;
    wallet.balanceATC += userATC;
    wallet.convertedTodayMinutes += minutes;
    wallet.lastConversionAt = new Date();

    await wallet.save({ session });

    pool.balanceATC -= grossATC;
    pool.spentTodayATC += grossATC;

    if (pool.balanceATC < pool.dailyLimitATC * 2) {
      pool.paused = true;
    }

    await pool.save({ session });

    /* ================= SYSTEM WALLET ================= */
    const systemWallet = await SystemWallet.findOneAndUpdate(
      {},
      {
        $inc: {
          totalProfitATC: profitATC,
          dailyProfitATC: profitATC,
          totalConversions: 1,
          profitFromConversion: profitATC,
        },
      },
      { upsert: true, new: true, session }
    );

    // 🔥 DAILY RESET FIX
    await resetProfitIfNewDay(systemWallet);

    /* ================= TRANSACTION ================= */
    await Transaction.create(
      [
        {
          userId,
          type: "CONVERT",
          amount: userATC,
          source: "MINUTES",
          meta: { minutes, rate },
        },
      ],
      { session }
    );

    /* ================= COMMIT ================= */
    await session.commitTransaction();
    session.endSession();

    /* ================= EMIT AFTER SUCCESS ================= */
    emitAdminEvent("ADMIN_ANALYTICS_UPDATE", {
      type: "PROFIT_UPDATE",
      amount: profitATC,
    });

    return res.json({
      success: true,
      minutesConverted: minutes,
      atcReceived: userATC,
      rate,
      remainingDailyMinutes:
        maxMinutes - wallet.convertedTodayMinutes,
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