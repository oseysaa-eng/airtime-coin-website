import { Request, Response } from "express";
import Earning from "../models/Earning";
import User from "../models/User";
import { pushWalletUpdate } from "../sockets/supportSocket";

/**
 * GET all earnings (admin)
 */
export const getEarnings = async (
  req: Request,
  res: Response
) => {
  try {
    const earnings = await Earning.find()
      .populate("userId", "email");

    res.json(earnings);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch earnings",
    });
  }
};

/**
 * CREATE earning + realtime wallet update
 */
export const createEarning = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      userId,
      minutes,
      atc,
      source = "ADS",
    } = req.body;

    if (!userId || !minutes || !atc) {
      return res.status(400).json({
        error: "Missing parameters",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found" });
    }

    // ✅ Save earning
    const earning = await Earning.create({
      userId,
      minutes,
      atc,
      source,
    });

    // ✅ Update wallet
    user.totalMinutes += minutes;
    user.totalEarnings += atc;
    await user.save();

    // ✅ Get socket instance
    const io = req.app.get("io");

    // ✅ Push realtime update
    pushWalletUpdate(
      io,
      user._id.toString(),
      {
        minutes: user.totalMinutes,
        atc: user.totalEarnings,
        balance: user.totalEarnings,
        source,
      }
    );

    res.status(201).json({
      success: true,
      earning,
      wallet: {
        minutes: user.totalMinutes,
        atc: user.totalEarnings,
      },
    });
  } catch (err) {
    console.error("EARNING ERROR:", err);
    res.status(500).json({
      error: "Failed to create earning",
    });
  }
};