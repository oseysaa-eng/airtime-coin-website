import express from "express";
import auth from "../middleware/authMiddleware";

import CallSession from "../models/CallSession";
import DailyCall from "../models/DailyCall";
import Wallet from "../models/Wallet";
import SystemSettings from "../models/SystemSettings";

import { runCallFraudChecks } from "../services/callFraudEngine";
import SpamNumber from "../models/SpamNumber";

const router = express.Router();

/* ============================================
   📱 HELPER: NORMALIZE PHONE NUMBER
============================================ */
const normalizeNumber = (num: string) => {
  if (!num) return "";

  num = num.replace(/\s+/g, "");

  if (num.startsWith("0")) return "+233" + num.slice(1);
  if (!num.startsWith("+")) return "+" + num;

  return num;
};

/* ============================================
   🚫 REPORT SPAM (PROTECTED + SAFE)
============================================ */
router.post("/report", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    let { number } = req.body;

    if (!number) {
      return res.status(400).json({ message: "Number required" });
    }

    number = normalizeNumber(number);

    let record = await SpamNumber.findOne({ number });

    if (record) {
      // ❌ prevent duplicate reporting
      if (record.reportedBy?.includes(userId)) {
        return res.json({
          success: false,
          message: "Already reported",
          reports: record.reports,
        });
      }

      record.reports += 1;
      record.reportedBy.push(userId);
      record.lastReportedAt = new Date();

      await record.save();

    } else {
      record = await SpamNumber.create({
        number,
        reports: 1,
        reportedBy: [userId],
      });
    }

    res.json({
      success: true,
      reports: record.reports,
    });

  } catch (err) {
    console.error("SPAM REPORT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================
   💰 AUTO CALL CREDIT (CORE ENGINE)
============================================ */
router.post("/auto-credit", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    let { seconds, phoneNumber } = req.body;

    phoneNumber = normalizeNumber(phoneNumber);

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
        reason: "Below 5 mins",
        phoneNumber,
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
        minutes: 0,
      });
    }

    if (daily.minutes >= 100) {
      return res.json({
        credited: 0,
        reason: "Daily limit reached",
      });
    }

    /* ---------------- FRAUD CHECK ---------------- */
    const fraud = await runCallFraudChecks({
      userId,
      duration: seconds,
      phoneNumber,
    });

    if (fraud.blocked) {
      await CallSession.create({
        userId,
        durationSeconds: seconds,
        creditedMinutes: 0,
        status: "fraud",
        reason: "Fraud detected",
        phoneNumber,
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
      phoneNumber,
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
      trustScore: fraud.trustScore,
    });

  } catch (err) {
    console.error("AUTO CREDIT ERROR:", err);
    res.status(500).json({ message: "Failed to process call" });
  }
});

/* ============================================
   📊 WEEKLY CALL DATA
============================================ */
router.get("/weekly", auth, async (req: any, res) => {
  try {
    const uid = req.user.id;

    const data = await CallSession.aggregate([
      {
        $match: {
          userId: uid,
          status: "valid",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
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

/* ============================================
   🔍 CHECK NUMBER (SMART RESPONSE)
============================================ */
router.post("/check-number", async (req, res) => {
  try {
    let { number } = req.body;

    if (!number) {
      return res.status(400).json({ message: "Number required" });
    }

    number = normalizeNumber(number);

    const spam = await SpamNumber.findOne({ number });

    if (spam) {
      return res.json({
        status: spam.reports >= 3 ? "spam" : "warning",
        reports: spam.reports,
        label:
          spam.reports >= 3
            ? `🚫 Reported ${spam.reports} times`
            : `⚠️ Reported ${spam.reports} times`,
      });
    }

    return res.json({
      status: "safe",
      label: "Safe Number",
    });

  } catch (err) {
    console.error("CHECK NUMBER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;