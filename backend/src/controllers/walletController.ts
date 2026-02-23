// src/controllers/walletController.ts
import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Transaction from '../models/Transaction';
import User from '../models/User';

export const getWalletSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('balance staked totalEarnings');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const transactions = await Transaction.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20);

    res.json({
      balance: user.balance,
      staked: user.staked,
      totalEarnings: user.totalEarnings,
      recent: transactions,
    });
  } catch (err) {
    console.error('getWalletSummary error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, source, metadata } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!type || !amount || !source) return res.status(400).json({ message: 'Missing fields' });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error('User not found');

      if (type === 'debit' && user.balance < amount) throw new Error('Insufficient balance');

      // update user
      user.balance = type === 'credit' ? user.balance + amount : user.balance - amount;
      await user.save({ session });

      const tx = new (await import('../models/Transaction')).default({
        userId: user._id,
        type,
        amount,
        source,
        metadata,
      });
      await tx.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'Transaction created', tx });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err: any) {
    console.error('createTransaction error', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};
