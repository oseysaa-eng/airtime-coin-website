import { Response } from "express";
import { CONVERSION_RULE } from "../config/conversion";
import { DAILY_LIMITS } from "../config/limits";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";


export const convertMinutes = async (req: any, res: Response) => {
  const { minutes } = req.body;
  const userId = req.user.id;

if (minutes > DAILY_LIMITS.maxConvertMinutes) {
  return res.status(400).json({
    message: "Daily conversion limit reached",
  });
}

  if (!minutes || minutes < CONVERSION_RULE.minConvertMinutes) {
    return res.status(400).json({
      message: `Minimum ${CONVERSION_RULE.minConvertMinutes} minutes required`,
    });
  }

  const wallet = await Wallet.findOne({ userId });
  if (!wallet || wallet.totalMinutes < minutes) {
    return res.status(400).json({ message: "Insufficient minutes" });
  }

  const atcAmount = minutes / CONVERSION_RULE.minutesPerATC;

  // UPDATE WALLET
  wallet.totalMinutes -= minutes;
  wallet.balanceATC += atcAmount;
  await wallet.save();

  // LOG TRANSACTION
  await Transaction.create({
    userId,
    type: "CONVERT",
    amount: atcAmount,
    source: "MINUTES_TO_ATC",
    status: "SUCCESS",
  });

  res.json({
    convertedATC: atcAmount,
    remainingMinutes: wallet.totalMinutes,
  });
};


