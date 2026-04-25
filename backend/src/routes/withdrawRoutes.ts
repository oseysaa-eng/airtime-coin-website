import express from "express";

import auth from "../middleware/authMiddleware";
import withdrawGuard from "../middleware/withdrawGuard";
import { withdrawLimiter } from "../middleware/rateLimiter";

import { processWithdrawal } from "../services/withdrawService";
import Transaction from "../models/Transaction";

const router = express.Router();

/* ============================================
   💸 CREATE WITHDRAWAL (MAIN ENTRY)
============================================ */
router.post(
  "/",
  auth,
  withdrawLimiter,
  withdrawGuard,
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          message: "Invalid amount",
        });
      }

      const result = await processWithdrawal({
        userId,
        amount,
      });

      return res.json({
        success: true,
        ...result,
      });

    } catch (err: any) {
      console.error("WITHDRAW ERROR:", err);

      return res.status(400).json({
        message: err.message || "Withdrawal failed",
      });
    }
  }
);

/* ============================================
   📜 WITHDRAW HISTORY
============================================ */
router.get(
  "/history",
  auth,
  withdrawGuard,
  async (req: any, res) => {
    try {
      const userId = req.user.id;

      const history = await Transaction.find({
        userId,
        type: "WITHDRAW",
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      return res.json({
        success: true,
        history,
      });

    } catch (err) {
      console.error("WITHDRAW HISTORY ERROR:", err);

      return res.status(500).json({
        message: "Failed to load history",
      });
    }
  }
);

export default router;