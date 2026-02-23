// src/controllers/stakingController.ts
import { Response } from 'express';
import moment from 'moment';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth';
import Stake from '../models/Stake';
import Transaction from '../models/Transaction';
import User from '../models/User';

export const createStake = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount, lockDays = 7, apy = 0.2, autoCompound = false } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const user = await User.findById(userId).session(session);
      if (!user) throw new Error('User not found');
      if (user.balance < amount) throw new Error('Insufficient balance');

      // subtract from balance and add to staked
      user.balance -= amount;
      user.staked += amount;
      await user.save({ session });

      const unlockAt = moment().add(lockDays, 'days').toDate();

      const stake = new Stake({ userId, amount, unlockAt, apy, autoCompound });
      await stake.save({ session });

      const tx = new Transaction({ userId, type: 'debit', amount, source: 'staking:create', metadata: { stakeId: stake._id } });
      await tx.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ message: 'Staked', stake });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err: any) {
    console.error('createStake error', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const unstake = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { stakeId } = req.params;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const stake = await Stake.findById(stakeId).session(session);
      if (!stake) throw new Error('Stake not found');
      if (stake.userId.toString() !== userId) throw new Error('Unauthorized stake');

      const user = await User.findById(userId).session(session);
      if (!user) throw new Error('User not found');

      // compute days staked
      const now = new Date();
      const daysStaked = Math.max(0, Math.floor((now.getTime() - stake.createdAt!.getTime()) / (1000*60*60*24)));
      const early = now < stake.unlockAt;
      const UNSTAKE_FEE = early ? 0.10 : 0; // 10% early fee

      // simple interest payout pro-rata (for demo). In prod schedule using cron or worker for precise math.
      const daysActive = daysStaked || 0;
      const dailyRate = stake.apy / 365;
      const earned = stake.amount * (Math.pow(1 + dailyRate, daysActive) - 1);

      const payout = stake.amount + earned;
      const fee = payout * UNSTAKE_FEE;
      const finalAmount = payout - fee;

      // update user balances
      user.staked = Math.max(0, user.staked - stake.amount);
      user.balance += finalAmount;
      user.totalEarnings += earned;
      await user.save({ session });

      // mark stake completed
      stake.status = 'completed';
      await stake.save({ session });

      // transactions: credit payout and fee record
      await Transaction.create([{ userId: user._id, type: 'credit', amount: finalAmount, source: 'staking:unstake', metadata: { stakeId: stake._id, earned, fee } },
                                 { userId: user._id, type: 'debit', amount: fee, source: 'staking:fee', metadata: { stakeId: stake._id } }], { session });

      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'Unstaked', finalAmount, earned, fee });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err: any) {
    console.error('unstake error', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

export const listStakes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const stakes = await Stake.find({ userId }).sort({ createdAt: -1 });
    res.json({ stakes });
  } catch (err) {
    console.error('listStakes', err);
    res.status(500).json({ message: 'Server error' });
  }
};
