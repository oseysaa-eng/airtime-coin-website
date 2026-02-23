import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";

const router = express.Router();


// Get wallet summary
router.get("/wallet", authMiddleware, async (req: any, res) => {
  let wallet = await Wallet.findOne({ userId: req.user.id });

  if (!wallet) {
    wallet = await Wallet.create({
      userId: req.user.id,
      balanceATC: 0,
      totalEarned: 0,
    });
  }

  res.json(wallet);
});


// Earn ATC
router.post("/earn", authMiddleware, async (req: any, res) => {
  const { amountATC } = req.body;

  if (!amountATC || amountATC <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const wallet = await Wallet.findOneAndUpdate(
    { userId: req.user.id },
    {
      $inc: {
        balanceATC: amountATC,
        totalEarned: amountATC,
      },
    },
    { new: true }
  );

  await Transaction.create({
    userId: req.user.id,
    type: "EARN",
    amountATC,
  });

  res.json({
    message: "Earning added",
    wallet
  });
});



export default router;
