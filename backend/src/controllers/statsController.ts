// controllers/statsController.ts
import { Request, Response } from 'express';
import User from '../models/User';

// GET /api/stats/total-users
export const getTotalUsers = async (_req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({});
    return res.status(200).json({ totalUsers });
  } catch (error) {
    console.error('Get Total Users Error:', error);
    return res.status(500).json({ message: 'Failed to get total users' });
  }
};
