import { Response } from "express";
import mongoose from "mongoose";
import Stake from "../models/Stake";
import User from "../models/User";

// Yield: 0.008% per day
const DAILY_RATE = 0.00008;

const calculateDays = (startDate: Date) => {
  const now = new Date();
  const diff = now.getTime() - startDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)); // to days
};

/** -------------------------
 * GET USER STAKES
 ---------------------------*/
export const getUserStakes = async (req: any, res: Response) => {
  try {
    const stakes = await Stake.find({ userId: req.user.id }).sort({ createdAt: -1 });

    const formatted = stakes.map((s) => {
      const days = calculateDays(s.startDate);
      const currentValue = s.amount * Math.pow(1 + DAILY_RATE, days);

      return {
        id: s._id,
        amount: s.amount,
        startDate: s.startDate,
        status: s.status,
        days,
        currentValue,
      };
    });

    const activeTotals = formatted
      .filter((s) => s.status === "active")
      .reduce((acc, s) => acc + s.currentValue, 0);

    res.json({
      success: true,
      activeTotals,
      stakes: formatted,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** -------------------------
 * CREATE STAKE
 ---------------------------*/
export const stakeATC = async (req: any, res: Response) => {
  try {
    let { amount } = req.body;
    amount = Number(amount);

    if (!amount || amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Minimum stake is 1 ATC.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient ATC balance",
      });
    }

    // Debit user's balance
    user.balance -= amount;
    await user.save();

    // Create stake record
    await Stake.create({
      userId: req.user.id,
      amount,
      currentValue: amount,
    });

    res.json({
      success: true,
      message: `Successfully staked ${amount} ATC`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/** -------------------------
 * UNSTAKE
 ---------------------------*/
export const unstakeATC = async (req: any, res: Response) => {
  try {
    const { stakeId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(stakeId)) {
      return res.status(400).json({ success: false, message: "Invalid stake ID" });
    }

    const stake = await Stake.findOne({ _id: stakeId, userId: req.user.id });

    if (!stake) {
      return res.status(404).json({ success: false, message: "Stake not found" });
    }

    if (stake.status === "unstaked") {
      return res.status(400).json({
        success: false,
        message: "Stake already withdrawn",
      });
    }

    // Calculate updated value
    const days = calculateDays(stake.startDate);
    const payout = stake.amount * Math.pow(1 + DAILY_RATE, days);

    stake.status = "unstaked";
    stake.currentValue = payout;
    await stake.save();

    // Credit user back
    const user = await User.findById(req.user.id);
    user.balance += payout;
    await user.save();

    res.json({
      success: true,
      payout,
      message: "Unstaked successfully",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
