import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/authMiddleware";

import CallSession from "../models/CallSession";
import SpamNumber from "../models/SpamNumber";

import { applyTrustPenalty } from "../services/trustEngine";
import { detectSuspiciousCall } from "../utils/fraudSignals";
import { callLimiter } from "../middleware/rateLimiter";

const router = express.Router();

/* ============================================
   📱 NORMALIZE PHONE NUMBER
============================================ */
const normalizeNumber = (num: string) => {
  if (!num) return "";

  num = num.replace(/\s+/g, "");

  if (num.startsWith("0")) return "+233" + num.slice(1);
  if (!num.startsWith("+")) return "+" + num;

  return num;
};

/* ============================================
   🚫 REPORT SPAM (SAFE + HARDENED)
============================================ */
router.post("/report", auth, callLimiter, async (req: any, res) => {
  try {
    const userId = req.user.id;
    let { number } = req.body;

    if (!number) {
      return res.status(400).json({ message: "Number required" });
    }

    number = normalizeNumber(number);

    const existing = await SpamNumber.findOne({ number });

    if (existing?.reportedBy.includes(userId)) {
      return res.json({
        success: false,
        message: "Already reported",
      });
    }

    /* 🔥 SAFE UPDATE */
    const result = await SpamNumber.findOneAndUpdate(
      { number },
      {
        $inc: { reports: 1 },
        $addToSet: { reportedBy: userId },
        $set: { lastReportedAt: new Date() },
      },
      {
        new: true,
        upsert: true,
      }
    );

    /* 🚨 FRAUD: TOO MANY REPORTS */
    if (result.reports > 20) {
      await applyTrustPenalty({
        userId,
        type: "SPAM_REPORT_ABUSE",
        meta: { number },
      });
    }

    return res.json({
      success: true,
      reports: result.reports,
    });

  } catch (err) {
    console.error("SPAM REPORT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================================
   📊 AUTO CREDIT (READ-ONLY)
============================================ */
router.post("/auto-credit", auth, async (req: any, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Session required" });
    }

    const session = await CallSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    return res.json({
      credited: session.creditedMinutes || 0,
      status: session.status,
    });

  } catch (err) {
    console.error("AUTO CREDIT ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
});

/* ============================================
   📊 WEEKLY CALL DATA
============================================ */
router.get("/weekly", auth, async (req: any, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.user.id);

    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 6);

    const data = await CallSession.aggregate([
      {
        $match: {
          userId: uid,
          status: "completed",
          createdAt: { $gte: past },
        },
      },
      {
        $group: {
          _id: { $isoDayOfWeek: "$createdAt" },
          minutes: { $sum: "$creditedMinutes" },
        },
      },
    ]);

    const weekMap: any = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
    };

    data.forEach((d) => {
      weekMap[d._id] = d.minutes;
    });

    return res.json({
      success: true,
      weeklyMinutes: Object.values(weekMap),
    });

  } catch (err) {
    console.error("❌ WEEKLY ERROR:", err);
    res.status(500).json({ message: "Failed to load weekly data" });
  }
});

/* ============================================
   🔍 CHECK NUMBER (PROTECTED)
============================================ */
router.post("/check-number", callLimiter, async (req, res) => {
  try {
    let { number } = req.body;

    if (!number) {
      return res.status(400).json({ message: "Number required" });
    }

    if (!number.match(/^\+?\d{9,15}$/)) {
      return res.status(400).json({ message: "Invalid number" });
    }

    number = normalizeNumber(number);

    const spam = await SpamNumber.findOne({ number }).lean();

    if (spam) {
      const isSpam = spam.reports >= 3;

      return res.json({
        status: isSpam ? "spam" : "warning",
        reports: spam.reports,
        label: isSpam
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