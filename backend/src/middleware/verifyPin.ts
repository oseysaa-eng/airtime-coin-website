import { NextFunction, Response } from "express";
import WithdrawalPin from "../models/WithdrawalPin";
import { comparePin } from "../utils/pinHash";

export default async function verifyPin(
  req: any,
  res: Response,
  next: NextFunction
) {
  const { pin } = req.body;

  if (!pin) {
    return res
      .status(403)
      .json({ message: "Transaction PIN required" });
  }

  const record = await WithdrawalPin.findOne({
    userId: req.user.id,
  });

  if (!record) {
    return res
      .status(403)
      .json({ message: "PIN not set" });
  }

  // 🔒 locked
  if (
    record.lockedUntil &&
    record.lockedUntil > new Date()
  ) {
    return res.status(403).json({
      message: "PIN locked. Try later.",
    });
  }

  const ok = await comparePin(
    pin,
    record.pinHash
  );

  if (!ok) {
    record.attempts += 1;

    if (record.attempts >= 5) {
      record.lockedUntil = new Date(
        Date.now() + 30 * 60 * 1000
      );
    }

    await record.save();

    return res
      .status(403)
      .json({ message: "Invalid PIN" });
  }

  // reset
  record.attempts = 0;
  record.lockedUntil = null;
  await record.save();

  next();
}