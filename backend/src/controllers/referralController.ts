import { Response } from "express";
import User from "../models/User";

export const getReferralCode = async (req: any, res: Response) => {
  const user = await User.findById(req.user.id).select("referralCode inviteCount earnedFromReferrals");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ referralCode: user.referralCode, inviteCount: user.inviteCount, earnedATC: user.earnedFromReferrals });
};

export const claimReferralReward = async (req: any, res: Response) => {
  // requires KYC, you can reward logic here
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  // implement claim logic...
  res.json({ message: "Claimed", amount: 0 });
};
