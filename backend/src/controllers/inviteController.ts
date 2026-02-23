import { Request, Response } from 'express';
import Invite from '../models/Invite';

export const getInvites = async (req: Request, res: Response) => {
  try {
    const invites = await Invite.find();
    res.json(invites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
};

export const createInvite = async (req: Request, res: Response) => {
  try {
    const invite = new Invite(req.body);
    await invite.save();
    res.status(201).json(invite);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create invite' });
  }
};
