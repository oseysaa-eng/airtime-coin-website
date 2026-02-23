import { Request, Response } from "express";
import User from "../models/User";

export const getUserSummary = async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ msg: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      balance: user.totalEarnings,
      chartData: user.chartData,
    });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
