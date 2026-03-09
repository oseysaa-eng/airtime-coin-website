import { Request, Response } from "express";
import User from "../models/User";

export const getProfile = async (req: any, res: Response) => {

  try {

    const user = await User.findById(req.user.id).select(
      "name email phone profileImage badges"
    );

    res.json(user);

  } catch (err) {

    res.status(500).json({
      message: "Failed to load profile",
    });

  }

};

export const updateProfile = async (req: any, res: Response) => {

  try {

    const userId = req.user.id;

    const { name, phone } = req.body;

    let profileImage;

    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    }

    const updateData: any = {
      name,
      phone,
    };

    if (profileImage) updateData.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      user,
    });

  } catch (err) {

    res.status(500).json({
      message: "Profile update failed",
    });

  }

};