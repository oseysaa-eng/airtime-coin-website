import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";

const router = express.Router();


// ───────────────────────── GET WALLET
router.get("/", authMiddleware, async (req: any, res) => {

  let wallet = await Wallet.findOne({ userId: req.user.id });

  if (!wallet) {
    wallet = await Wallet.create({
      userId: req.user.id,
      balanceATC: 0,
      totalEarned: 0,
    });
  }

  res.json({
    balanceATC: wallet.balanceATC || 0,
    totalEarnedATC: wallet.totalEarnedATC || 0
  });

});


// ───────────────────────── EARN ATC
router.post("/earn", authMiddleware, async (req: any, res) => {

  const { amountATC } = req.body;

  if (!amountATC || amountATC <= 0) {
    return res.status(400).json({
      message: "Invalid amount"
    });
  }

  const wallet = await Wallet.findOneAndUpdate(
    { userId: req.user.id },
    {
      $inc: {
        balanceATC: amountATC,
        totalEarned: amountATC
      }
    },
    { new: true, upsert: true }
  );

  await Transaction.create({
    userId: req.user.id,
    type: "EARN",
    amount: amountATC,
    source: "SYSTEM"
  });

  res.json({
    message: "Earning added",
    balanceATC: wallet.balanceATC
  });

});

export default router;