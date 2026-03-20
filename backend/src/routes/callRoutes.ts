import express from "express";
import auth from "../middleware/authMiddleware";

import CallSession from "../models/CallSession";
import DailyCall from "../models/DailyCall";
import Wallet from "../models/Wallet";
import SystemSettings from "../models/SystemSettings";

import { runCallFraudChecks } from "../services/callFraudEngine";

const router = express.Router();

/**
 * ============================================
 * AUTO CALL CREDIT (CORE ENGINE)
 * ============================================
 */
router.post("/auto-credit", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { seconds, phoneNumber } = req.body;

    /* ---------------- GLOBAL PAUSE ---------------- */
    const settings = await SystemSettings.findOne();
    if (settings?.incidentMode?.active) {
      return res.status(403).json({
        message: "System temporarily unavailable",
      });
    }

    const minutes = Math.floor(seconds / 60);

    /* ---------------- MIN 5 MINUTES ---------------- */
    if (minutes < 5) {
      await CallSession.create({
        userId,
        durationSeconds: seconds,
        creditedMinutes: 0,
        status: "rejected",
        reason: "Below 5 mins"
      });

      return res.json({ credited: 0 });
    }

    /* ---------------- DAILY LIMIT ---------------- */
    const today = new Date().toISOString().slice(0, 10);

    let daily = await DailyCall.findOne({ userId, date: today });

    if (!daily) {
      daily = await DailyCall.create({
        userId,
        date: today,
        minutes: 0
      });
    }

    if (daily.minutes >= 100) {
      return res.json({
        credited: 0,
        reason: "Daily limit reached"
      });
    }

    /* ---------------- FRAUD CHECK ---------------- */
    const fraud = await runCallFraudChecks({
      userId,
      duration: seconds,
      phoneNumber
    });

    if (fraud.blocked) {
      await CallSession.create({
        userId,
        durationSeconds: seconds,
        creditedMinutes: 0,
        status: "fraud",
        reason: "Fraud detected"
      });

      return res.json({ credited: 0 });
    }

    /* ---------------- CREDIT ---------------- */
    let credit = minutes;

    if (daily.minutes + credit > 100) {
      credit = 100 - daily.minutes;
    }

    /* ---------------- SAVE SESSION ---------------- */
    await CallSession.create({
      userId,
      durationSeconds: seconds,
      creditedMinutes: credit,
      status: "valid",
      phoneNumber
    });

    /* ---------------- UPDATE DAILY ---------------- */
    daily.minutes += credit;
    await daily.save();

    /* ---------------- UPDATE WALLET ---------------- */
    await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { totalMinutes: credit } },
      { upsert: true }
    );

    res.json({
      credited: credit,
      totalToday: daily.minutes,
      trustScore: fraud.trustScore
    });

  } catch (err) {
    console.error("AUTO CREDIT ERROR:", err);
    res.status(500).json({ message: "Failed to process call" });
  }
});


/**
 * ============================================
 * WEEKLY CALL DATA (CHART)
 * ============================================
 */
router.get("/weekly", auth, async (req: any, res) => {
  try {
    const uid = req.user.id;

    const data = await CallSession.aggregate([
      {
        $match: {
          userId: uid,
          status: "valid" // ✅ FIXED
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            },
          },
          minutes: { $sum: "$creditedMinutes" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);

  } catch (err) {
    console.error("WEEKLY ERROR:", err);
    res.status(500).json({ message: "Failed to load weekly data" });
  }
});

export default router;