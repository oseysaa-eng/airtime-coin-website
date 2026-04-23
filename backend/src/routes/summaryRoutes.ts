import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/authMiddleware";

import EmissionState from "../models/EmissionState";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import User from "../models/User";
import UserTrust from "../models/UserTrust";

const router = express.Router();

router.get("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;

    /* ================= PARALLEL ================= */
    const [user, settings, emission, walletRaw, trust] =
      await Promise.all([
        User.findById(userId).lean(),
        SystemSettings.findOne().lean(),
        EmissionState.findOne().lean(),
        Wallet.findOne({ userId }).lean(),
        UserTrust.findOne({ userId }).lean(),
      ]);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ================= WALLET SAFE (ATOMIC) ================= */
    const wallet = walletRaw
      ? walletRaw
      : await Wallet.findOneAndUpdate(
          { userId },
          { $setOnInsert: { userId } },
          { upsert: true, new: true }
        ).lean();

    /* ================= DAILY RESET ================= */
    let todayMinutes = wallet.todayMinutes || 0;

    if (wallet.lastDailyReset) {
      const now = new Date();
      const last = new Date(wallet.lastDailyReset);

      if (now.toDateString() !== last.toDateString()) {


        todayMinutes = 0;

      // keep response consistent immediately
      wallet.todayMinutes = 0;

      Wallet.updateOne(
        { userId },
        {
          todayMinutes: 0,
          dailyEarned: { ads: 0, calls: 0, surveys: 0 },
          lastDailyReset: new Date(),
        }
      ).catch(() => {});

      }
    }

/* ================= WEEKLY (FIXED) ================= */

const uid = new mongoose.Types.ObjectId(userId); // ✅ FIX

const today = new Date();
today.setHours(23, 59, 59, 999);

const past = new Date();
past.setDate(today.getDate() - 6);
past.setHours(0, 0, 0, 0);

const weeklyData = await Transaction.aggregate([
  {
    $match: {
      userId: uid,
      type: "EARN",
      createdAt: {
        $gte: past,
        $lte: today,
      },
    },
  },
  {
    $group: {
      _id: { $dayOfWeek: "$createdAt" },

      minutes: {
  $sum: { $ifNull: ["$meta.minutes", 0] }
}
    },
  },
]);

/* ================= FORMAT FULL WEEK ================= */

const weekMap: any = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0,
};

weeklyData.forEach((d: any) => {
  weekMap[d._id] = d.minutes;
});

const weeklyMinutes = [
  weekMap[2], // Mon
  weekMap[3],
  weekMap[4],
  weekMap[5],
  weekMap[6],
  weekMap[7],
  weekMap[1], // Sun
];

    /* ================= RECENT ================= */

    const recentTx = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("type amount source createdAt")
      .lean();

    /* ================= TRUST ================= */

    const trustScore = trust?.score ?? 100;

    let trustStatus = "excellent";
if (trustScore < 80) trustStatus = "reduced";
if (trustScore < 60) trustStatus = "limited";
if (trustScore < 40) trustStatus = "blocked";

    /* ================= RESPONSE ================= */

        /* ================= ECONOMICS ================= */

const rate = settings?.economics?.minuteToATCRate ?? 0.0025;
const price = settings?.economics?.atcToCedisPrice ?? 0.0025;
const balanceATC = wallet.balanceATC || 0;

const balanceCedis = Number((balanceATC * price).toFixed(6));
const todayATC = Number((todayMinutes * rate).toFixed(6));
const weeklyATC = weeklyMinutes.map( (m: number) => Number((m * rate).toFixed(6)));

res.json({
  user: {
    name: user.name || "User",
    profileImage: user.profileImage || null,
  },

  wallet: {
    balanceATC,
    balanceCedis,
    staked: wallet.stakedATC || 0,
  },

  earnings: {
    totalMinutes: wallet.totalMinutes || 0,
    todayMinutes,
    todayATC,
  },

  weekly: {
    minutes: weeklyMinutes,
    atc: weeklyATC,
  },

  economics: {
    rate,
    price,
  },

  trust: {
    score: trustScore,
    status: trustStatus,
  },

  recentTx,

  emission: {
    multiplier: emission?.multiplier ?? 1,
    phase: emission?.phase ?? 0,
  },

  beta: {
    active: settings?.beta?.active ?? false,
    conversionEnabled: settings?.beta?.showConversion ?? false,
    withdrawalEnabled: settings?.beta?.showWithdrawals ?? false,
  },
});
    
  } catch (err) {
    console.error("SUMMARY ERROR:", err);

    res.status(500).json({
      message: "Failed to load dashboard",
    });
  }
});

export default router;