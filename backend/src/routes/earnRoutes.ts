import express from "express";
import auth from "../middleware/authMiddleware";
import SystemSettings from "../models/SystemSettings";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";
import { rewardEngine } from "../services/rewardEngine";

const router = express.Router();

router.post("/", auth, async (req: any, res) => {

  try {

    const userId = req.user.id;

    const settings = await SystemSettings.findOne();

    if (settings?.rewardsPaused)
      return res.status(403).json({
        message: "Rewards paused"
      });

    const today = new Date().toISOString().slice(0,10);

    let stats = await UserDailyStats.findOne({ userId, date: today });

    if (!stats)
      stats = await UserDailyStats.create({
        userId,
        date: today
      });

    if (stats.dailyBonusClaimed)
      return res.status(403).json({
        message: "Daily bonus already claimed"
      });

    const trust =
      (await UserTrust.findOne({ userId })) ||
      (await UserTrust.create({ userId }));

    if (trust.score < 40)
      return res.status(403).json({
        message: "Trust blocked"
      });

    const MINUTES =
      settings?.beta?.active
        ? settings.beta.dailyBonusMinutes || 3
        : 3;

    const io = req.app.get("io");

    await rewardEngine({
      userId,
      minutes: MINUTES,
      source: "DAILY_BONUS",
      io
    });

    stats.dailyBonusClaimed = true;
    stats.minutesEarned += MINUTES;

    await stats.save();

    res.json({
      success: true,
      earnedMinutes: MINUTES
    });

  } catch (err) {

    console.error("DAILY BONUS ERROR:", err);

    res.status(500).json({
      message: "Failed to claim daily bonus"
    });

  }

});

export default router;