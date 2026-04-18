import express, { Request, Response } from "express";
import isAuthenticated from "../middleware/authMiddleware";
import Transaction from "../models/Transaction";

const router = express.Router();

/* ================= GET USER TRANSACTIONS ================= */
router.get("/", isAuthenticated, async (req: any, res: Response) => {
  const userId = req.user.id;

  const page = Number(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      page,
      count: transactions.length,
      transactions,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

/* ================= CREATE TRANSACTION (LIMITED USE) ================= */
router.post("/", isAuthenticated, async (req: any, res: Response) => {
  const userId = req.user.id;
  const { type, amount, source } = req.body;

  /* 🔒 STRICT VALIDATION */
  if (!type || typeof amount !== "number") {
    return res.status(400).json({
      message: "Invalid transaction data",
    });
  }

  /* 🔒 BLOCK ABUSE */
  if (amount <= 0 || amount > 1000) {
    return res.status(400).json({
      message: "Invalid amount range",
    });
  }

  try {
    const tx = await Transaction.create({
      userId,
      type,
      amount,
      source: source || "MANUAL",
      meta: {},
    });

    res.status(201).json({
      success: true,
      transaction: tx,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Transaction failed" });
  }
});

export default router;