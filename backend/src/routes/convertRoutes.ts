import express from "express";
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
  try {

    const uid = req.user.id;
    const { minutes } = req.body;

    if (!minutes || minutes <= 0) {
      return res.status(400).json({ message: "Invalid minutes amount" });
    }

    const settings = await SystemSettings.findOne();

    if (settings?.beta?.active && !settings.beta.showConversion) {
      return res.status(403).json({
        code: "BETA_CONVERSION_DISABLED",
        message: "Conversion is disabled during beta",
      });
    }

    const wallet =
      (await Wallet.findOne({ userId: uid })) ||
      (await Wallet.create({ userId: uid }));

    /* DAILY RESET */

    if (
      !wallet.lastConversionReset ||
      new Date().toDateString() !==
        wallet.lastConversionReset.toDateString()
    ) {
      wallet.convertedTodayMinutes = 0;
      wallet.lastConversionReset = new Date();
    }

    if (wallet.totalMinutes < minutes) {
      return res.status(400).json({ message: "Insufficient minutes" });
    }

    /* TRUST CHECK */

    const trust =
      (await UserTrust.findOne({ userId: uid })) ||
      (await UserTrust.create({ userId: uid }));

    if (trust.score < 40) {
      return res.status(403).json({
        code: "TRUST_BLOCKED",
        message: "Conversion blocked due to trust status",
      });
    }

    let maxMinutes = 300;

    if (trust.score < 80) maxMinutes = 150;
    if (trust.score < 60) maxMinutes = 50;

    if (settings?.beta?.active) {
      maxMinutes = Math.min(maxMinutes, settings.beta.maxConvertMinutes || 50);
    }

    if (wallet.convertedTodayMinutes + minutes > maxMinutes) {
      return res.status(403).json({
        code: "DAILY_LIMIT_REACHED",
        message: `Daily conversion limit reached (${maxMinutes} mins)`,
      });
    }

    /* CONVERSION POOL */

    let pool = await ConversionPool.findOne({ source: "AIRTIME" });

    if (!pool) {
      pool = await ConversionPool.create({
        source: "AIRTIME",
        balanceATC: 1000000,
        rate: 0.0025,
        dailyLimitATC: 50000,
        spentTodayATC: 0,
        paused: false,
      });
    }

    await resetIfNewDay(pool);

    if (pool.paused) {
      return res.status(403).json({
        code: "POOL_PAUSED",
        message: "Conversion temporarily paused",
      });
    }

    /* EMISSION ENGINE */

    await runEmissionHalvingIfNeeded();

    const rate = await getDynamicRate();

    const atcAmount = Number((minutes * rate).toFixed(6));

    /* TREASURY CHECK */

    if (pool.spentTodayATC + atcAmount > pool.dailyLimitATC) {
      return res.status(403).json({
        code: "POOL_DAILY_LIMIT",
        message: "Daily conversion pool limit reached",
      });
    }

    if (pool.balanceATC < atcAmount) {
      return res.status(403).json({
        code: "POOL_EMPTY",
        message: "Conversion pool depleted",
      });
    }

    /* UPDATE WALLET */

    wallet.totalMinutes -= minutes;
    wallet.balanceATC += atcAmount;
    wallet.convertedTodayMinutes += minutes;
    wallet.lastConversionAt = new Date();

    await wallet.save();

    /* UPDATE POOL */

    pool.balanceATC -= atcAmount;
    pool.spentTodayATC += atcAmount;

    if (pool.balanceATC < pool.dailyLimitATC * 2) {
      pool.paused = true;
    }

    await pool.save();

    /* LOG TRANSACTION */

    await Transaction.create({
      userId: uid,
      type: "CONVERT",
      amount: atcAmount,
      source: "MINUTES",
      meta: {
        minutes,
        rate,
        beta: settings?.beta?.active || false,
      },
    });

    res.json({
      success: true,
      minutesConverted: minutes,
      atcReceived: atcAmount,
      rate,
      remainingDailyMinutes:
        maxMinutes - wallet.convertedTodayMinutes,
      betaActive: settings?.beta?.active || false,
    });

  } catch (err) {

    console.error("CONVERT ERROR:", err);

    res.status(500).json({
      message: "Conversion failed",
    });

  }
});

export default router;