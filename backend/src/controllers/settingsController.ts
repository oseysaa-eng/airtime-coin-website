import { Response } from 'express';
import User from '../models/User';

export const getSettings = async (req: any, res: Response) => {
  const user = await User.findById(req.user.id).select('notifications biometric theme withdrawalPin kycStatus');
  res.json({ settings: user });
};

export const updateSettings = async (req: any, res: Response) => {
  const { notifications, biometric, theme } = req.body;
  const updates: any = {};
  if (notifications !== undefined) updates.notifications = notifications;
  if (biometric !== undefined) updates.biometric = biometric;
  if (theme !== undefined) updates.theme = theme;

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
  res.json({ success: true, user });
};
