import { Response } from 'express';
import User from '../models/User';

export const getProfile = async (req: any, res: Response) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const updates: any = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;

    if (req.file) {
      // TODO: move file to R2 / S3 and set URL
      // simple local file -> serve via /uploads
      const url = `/uploads/${req.file.filename}`;
      updates.profileImage = `${process.env.API_BASE_URL || ''}${url}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    console.error('updateProfile', err);
    res.status(500).json({ message: 'Server error' });
  }
};
