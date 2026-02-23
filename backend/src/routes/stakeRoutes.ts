import express from "express";
import auth from "../middleware/authMiddleware";
import Stake from "../models/Stake";
import Wallet from "../models/Wallet";

const router = express.Router();

/**
 * POST /api/stake
 * Stake ATC (lock for 30 days)
 */
router.post("/", auth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid stake amount" });
    }

    // Minimum stake
    if (amount < 10) {
      return res
        .status(400)
        .json({ message: "Minimum stake is 10 ATC" });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balanceATC < amount) {
      return res.status(400).json({ message: "Insufficient ATC balance" });
    }

    // Check if user already has active stake
    const activeStake = await Stake.findOne({
      userId,
      status: "active",
    });

    if (activeStake) {
      return res
        .status(400)
        .json({ message: "You already have an active stake" });
    }

    const rewardRate = 0.05; // 5%
    const rewardAmount = Number((amount * rewardRate).toFixed(6));

    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + 30);

    // Deduct ATC from wallet
    wallet.balanceATC -= amount;
    await wallet.save();

    const stake = await Stake.create({
      userId,
      amount,
      rewardRate,
      rewardAmount,
      unlockDate,
    });

    res.json({
      message: "Stake successful",
      stake: {
        amount: stake.amount,
        rewardAmount: stake.rewardAmount,
        unlockDate: stake.unlockDate,
      },
    });
  } catch (err) {
    console.error("STAKE ERROR:", err);
    res.status(500).json({ message: "Failed to stake ATC" });
  }
});

/**
 * GET /api/stake
 * Get user's active stake
 */
router.get("/", auth, async (req: any, res) => {
  const stake = await Stake.findOne({
    userId: req.user.id,
    status: "active",
  });

  res.json(stake || null);
});

export default router;
