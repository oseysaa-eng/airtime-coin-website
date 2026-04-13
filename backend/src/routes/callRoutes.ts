import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/authMiddleware";

import CallSession from "../models/CallSession";
import SpamNumber from "../models/SpamNumber";

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
   🚫 REPORT SPAM
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
      if (record.reportedBy?.includes(userId)) {
        return res.json({
          success: false,
          message: "Already reported",
          reports: record.reports,
        });
      }

      // 🚫 limit abuse
      if (record.reports > 50) {
        return res.json({ success: false, message: "Max reports reached" });
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

    return res.json({
      success: true,
      reports: record.reports,
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

    // 🔥 ONLY RETURN STATUS (NO CREDIT HERE)
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
    const uid = new mongoose.Types.ObjectId(req.user.id); // ✅ FIX

    /* ================= LAST 7 DAYS ================= */
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const past = new Date();
    past.setDate(today.getDate() - 6);
    past.setHours(0, 0, 0, 0);

    const data = await CallSession.aggregate([
      {
        $match: {
          userId: uid,
          status: "completed",
          createdAt: {
            $gte: past,
            $lte: today,
          },
        },
      },
      {
        $group: {
          _id: {
            $dayOfWeek: "$createdAt", // 1 = Sunday
          },
          minutes: { $sum: "$creditedMinutes" },
        },
      },
    ]);

    /* ================= FORMAT FULL WEEK ================= */
    const weekMap: any = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
    };

    data.forEach((d) => {
      weekMap[d._id] = d.minutes;
    });

    const ordered = [
      weekMap[2], // Mon
      weekMap[3], // Tue
      weekMap[4],
      weekMap[5],
      weekMap[6],
      weekMap[7],
      weekMap[1], // Sun
    ];

    return res.json({
      success: true,
      weeklyMinutes: ordered,
    });

  } catch (err) {
    console.error("❌ WEEKLY ERROR:", err);
    res.status(500).json({ message: "Failed to load weekly data" });
  }
});

/* ============================================
   🔍 CHECK NUMBER
============================================ */
router.post("/check-number", async (req, res) => {
  try {
    let { number } = req.body;

    if (!number) {
      return res.status(400).json({ message: "Number required" });
    }

    // 🔐 validate format
    if (!number.match(/^\+?\d{9,15}$/)) {
      return res.status(400).json({ message: "Invalid number" });
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