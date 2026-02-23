import { NextFunction, Request, Response } from "express";
import SystemSettings from "../models/SystemSettings";

export default async function betaWithdrawGuard(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const settings = await SystemSettings.findOne();

    if (settings?.beta?.active && !settings.beta.showWithdrawals) {
      return res.status(403).json({
        code: "BETA_WITHDRAW_DISABLED",
        message: "Withdrawals are disabled during beta testing",
      });
    }

    next();
  } catch (err) {
    console.error("Beta withdraw guard error:", err);
    res.status(500).json({
      message: "Unable to verify withdrawal availability",
    });
  }
}