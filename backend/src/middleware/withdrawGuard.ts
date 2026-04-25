import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import UserTrust from "../models/UserTrust";
import SystemSettings from "../models/SystemSettings";
import KYC from "../models/KYC";

export default async function withdrawGuard(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user.id;

    /* ================= SYSTEM CHECK ================= */
    const settings = await SystemSettings.findOne();

    if (settings?.incidentMode?.active) {
      return res.status(503).json({
        message: "Withdrawals temporarily disabled",
      });
    }

    if (settings?.beta?.active && !settings.beta.showWithdrawals) {
      return res.status(403).json({
        message: "Withdrawals disabled during beta",
      });
    }

    /* ================= USER ================= */
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    /* ================= TRUST ================= */
    const trust = await UserTrust.findOne({ userId });

    if (!trust || trust.score < 60) {
      return res.status(403).json({
        message: "Low trust score",
      });
    }

    /* ================= KYC ================= */
    const kyc = await KYC.findOne({ userId });

    if (!kyc || kyc.status !== "verified") {
      return res.status(403).json({
        message: "KYC verification required",
      });
    }

    /* ================= COOLDOWN ================= */
    if (user.lastWithdrawalAt) {
      const diff =
        Date.now() - new Date(user.lastWithdrawalAt).getTime();

      const MIN_INTERVAL = 60 * 60 * 1000; // 1 hour

      if (diff < MIN_INTERVAL) {
        return res.status(429).json({
          message: "Withdrawal cooldown active",
        });
      }
    }

    next();

  } catch (err) {
    console.error("Withdraw guard error:", err);
    res.status(500).json({
      message: "Withdrawal validation failed",
    });
  }
}