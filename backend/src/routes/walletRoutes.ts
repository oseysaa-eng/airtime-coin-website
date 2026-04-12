import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";

import { pushWalletUpdate } from "../sockets/socket";

const router = express.Router();

/* =========================================
   GET WALLET
========================================= */
router.get("/", authMiddleware, async (req: any, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user.id,
        balanceATC: 0,
        totalEarnedATC: 0, // ✅ FIXED naming
        totalMinutes: 0,
        todayMinutes: 0,
      });
    }

    res.json({
      balanceATC: wallet.balanceATC || 0,
      totalEarnedATC: wallet.totalEarnedATC || 0,
      totalMinutes: wallet.totalMinutes || 0,
      todayMinutes: wallet.todayMinutes || 0,
    });
  } catch (err) {
    console.error("WALLET FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to load wallet" });
  }
});

/* =========================================
   EARN ATC (MANUAL / ADMIN / SYSTEM)
========================================= */
router.post("/earn", authMiddleware, async (req: any, res) => {
  try {
    const { amountATC } = req.body;

    if (!amountATC || isNaN(amountATC) || amountATC <= 0) {
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

    /* ================= UPDATE WALLET ================= */
    const wallet = await Wallet.findOneAndUpdate(
      { userId: req.user.id },
      {
        $inc: {
          balanceATC: amountATC,
          totalEarnedATC: amountATC, // ✅ FIXED
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    /* ================= TRANSACTION ================= */
    await Transaction.create({
      userId: req.user.id,
      type: "EARN",
      amount: amountATC,
      source: "SYSTEM",
    });

    /* ================= REAL-TIME UPDATE ================= */
    pushWalletUpdate(req.user.id.toString(), {
      balance: wallet.balanceATC,
      totalMinutes: wallet.totalMinutes || 0,
      todayMinutes: wallet.todayMinutes || 0,
      source: "SYSTEM",
    });

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      message: "Earning added",
      balanceATC: wallet.balanceATC,
    });

  } catch (err) {
    console.error("WALLET EARN ERROR:", err);
    res.status(500).json({
      message: "Failed to add earnings",
    });
  }
});

export default router;