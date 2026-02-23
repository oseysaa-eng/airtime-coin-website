// controllers/transactionController.ts
import { Request, Response } from 'express';
import Transaction from '../models/Transaction';

// GET /api/transactions
export const getAllTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Get All Transactions Error:', error);
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
};
