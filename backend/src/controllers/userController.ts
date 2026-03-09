import { Request, Response } from "express";
import User from "../models/User";
import Wallet from "../models/Wallet";

export const getUserSummary = async (req: any, res: Response) => {

  try {

    const userId = req.user.id;

    const user = await User.findById(userId);

    const wallet =
      (await Wallet.findOne({ userId })) ||
      (await Wallet.create({ userId }));

    res.json({
      name: user?.name || "User",
      email: user?.email,
      userId: user?.userId,
      profileImage: user?.profileImage,

      balance: wallet.balanceATC || 0,
      totalMinutes: wallet.totalMinutes || 0,
      todayMinutes: wallet.todayMinutes || 0,
    });

  } catch (err) {

    res.status(500).json({
      message: "Failed to load summary",
    });

  }

};