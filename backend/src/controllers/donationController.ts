import { Response } from "express";
import Donation from "../models/Donation";
import User from "../models/User";
import Wallet from "../models/Wallet";

export const sendDonation = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { amount, toUserId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    wallet.balance = Number((wallet.balance - amount).toFixed(8));
    await wallet.save();

    const donation = await Donation.create({ userId, toUserId: toUserId || null, amount });

    // update receiver's donationTotal if toUserId provided
    if (toUserId) {
      const receiver = await User.findById(toUserId);
      if (receiver) {
        receiver.totalDonations = (receiver.totalDonations || 0) + amount;
        // recompute donorBadge if you have logic
        await receiver.save();
      }
    }

    return res.json({ message: "Donation sent", donation });
  } catch (err) {
    console.error("sendDonation", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const donationHistory = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const list = await Donation.find({ userId }).sort({ createdAt: -1 });
    return res.json({ donations: list });
  } catch (err) {
    console.error("donationHistory", err);
    return res.status(500).json({ message: "Server error" });
  }
};
