// routes/transactionRoutes.ts
import express, { Request, Response } from 'express';
import isAuthenticated from '../middleware/authMiddleware';
import Transaction from '../models/Transaction';

const router = express.Router();

// GET /transactions - Get all transactions for the authenticated user
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  try {
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

// POST /transactions - Record a new transaction
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  const { type, amount, description } = req.body;
  const userId = (req as any).user._id;

  if (!type || !amount) {
    return res.status(400).json({ message: 'Transaction type and amount are required' });
  }

  try {
    const transaction = new Transaction({
      user: userId,
      type,
      amount,
      description,
      createdAt: new Date(),
    });

    await transaction.save();

    res.status(201).json({ message: 'Transaction recorded', transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Transaction failed' });
  }
});

export default router;
