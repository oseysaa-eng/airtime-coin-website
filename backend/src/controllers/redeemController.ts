import { Request, Response } from 'express';
import Redeem from '../models/Redeem';

export const getRedeems = async (req: Request, res: Response) => {
  try {
    const redeems = await Redeem.find();
    res.json(redeems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch redeems' });
  }
};

export const createRedeem = async (req: Request, res: Response) => {
  try {
    const redeem = new Redeem(req.body);
    await redeem.save();
    res.status(201).json(redeem);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create redeem' });
  }
};
