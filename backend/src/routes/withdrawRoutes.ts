import express from "express";
import { getWithdrawHistory, requestWithdraw } from "../controllers/withdrawController";
import requireKYC from "../middleware/requireKYC";
import SystemSettings from "../models/SystemSettings";

import auth from "../middleware/authMiddleware";
import withdrawGuard from "../middleware/withdrawGuard";
import { withdrawLimiter } from "../middleware/rateLimiter";

import { processWithdrawal } from "../services/withdrawService";


const router = express.Router();

/* ============================================
   💸 WITHDRAW
============================================ */
router.post("/", auth, withdrawLimiter, withdrawGuard, async (req: any, res) => {
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

    res.json(result);

  } catch (err: any) {
    console.error("WITHDRAW ERROR:", err);

    res.status(400).json({
      message: err.message || "Withdrawal failed",
    });
  }
});

/**
 * POST /api/withdraw/request
 */
router.post(
  "/request",
  auth,
  requireKYC,
  async (req, res, next) => {
    try {
      const settings = await SystemSettings.findOne();

      if (settings?.beta?.active && !settings.beta.showWithdrawals) {
        return res.status(403).json({
          message: "Withdrawals are disabled during beta",
        });
      }

      return requestWithdraw(req, res);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/withdraw/history
 */
router.get(
  "/history",
  auth,
  requireKYC,
  async (req, res, next) => {
    try {
      const settings = await SystemSettings.findOne();

      if (settings?.beta?.active && !settings.beta.showWithdrawals) {
        return res.status(403).json({
          message: "Withdrawals are disabled during beta",
        });
      }

      return getWithdrawHistory(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;