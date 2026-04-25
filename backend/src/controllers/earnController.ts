import { Request, Response } from "express";
import Earning from "../models/Earning";
import User from "../models/User";
import { pushWalletUpdate } from "../sockets/supportSocket";
import { applyEarning } from "../services/earnService";


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
    const { userId, minutes, atc, source = "ADS" } = req.body;

    if (!userId || !minutes || !atc) {
      return res.status(400).json({
        error: "Missing parameters",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    /* ================= APPLY EARNING ================= */
    let wallet;

    try {
      wallet = await applyEarning(userId, minutes, atc);
    } catch (err: any) {
      return res.status(403).json({
        message: err.message,
      });
    }

    /* ================= SAVE LOG ================= */
    const earning = await Earning.create({
      userId,
      minutes,
      atc,
      source,
    });

    /* ================= SOCKET ================= */
    const io = req.app.get("io");

    pushWalletUpdate(io, userId, {
      minutes: wallet.totalMinutes,
      todayMinutes: wallet.todayMinutes,
      balance: wallet.balanceATC,
      source,
    });

    /* ================= RESPONSE ================= */
    res.status(201).json({
      success: true,
      earning,
      wallet: {
        totalMinutes: wallet.totalMinutes,
        todayMinutes: wallet.todayMinutes,
        balance: wallet.balanceATC,
      },
    });

  } catch (err) {
    console.error("EARNING ERROR:", err);

    res.status(500).json({
      error: "Failed to create earning",
    });
  }
};

