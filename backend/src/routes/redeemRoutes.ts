// routes/redeemRoutes.ts
import express, { Request, Response } from 'express';
import { isAuthenticated } from '../middleware/authMiddleware';
import Redeem from '../models/Redeem';

const router = express.Router();

// POST /redeem - Submit a withdrawal/redeem request
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  const userId = (req as any).user._id;
  const { amount, mobileNumber } = req.body;

  try {
    const redeem = new Redeem({
      user: userId,
      amount,
      mobileNumber,
      date: new Date(),
    });

    await redeem.save();
    res.status(201).json({ message: 'Redeem request submitted', redeem });
  } catch (err) {
    console.error('Redeem request error:', err);
    res.status(500).json({ message: 'Failed to submit redeem request' });
  }
});

// GET /redeem - View user’s redeem history
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  try {
    const redeems = await Redeem.find({ user: userId }).sort({ date: -1 });
    res.status(200).json({ redeems });
  } catch (err) {
    console.error('Fetching redeem history error:', err);
    res.status(500).json({ message: 'Failed to fetch redeem history' });
  }
});

export default router;
