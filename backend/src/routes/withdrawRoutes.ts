import express from "express";
import { getWithdrawHistory, requestWithdraw } from "../controllers/withdrawController";
import authMiddleware from "../middleware/authMiddleware";
import requireKYC from "../middleware/requireKYC";
import SystemSettings from "../models/SystemSettings";

const router = express.Router();

/**
 * POST /api/withdraw/request
 */
router.post(
  "/request",
  authMiddleware,
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
  authMiddleware,
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