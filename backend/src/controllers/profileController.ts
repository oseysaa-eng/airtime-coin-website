import { Response } from "express";
import User from "../models/User";

export const getProfile = async (req: any, res: Response) => {

  try {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      profileImage: user.profileImage || null,
      badges: user.badges || []
    });

  } catch (err) {

    console.error("getProfile error:", err);

    res.status(500).json({ message: "Server error" });

  }

};


export const updateProfile = async (req: any, res: Response) => {

  try {

    const updates: any = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;

    if (req.file) {

      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      updates.profileImage = imageUrl;

    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select("-password");

    res.json(user);

  } catch (err) {

    console.error("updateProfile error:", err);

    res.status(500).json({ message: "Server error" });

  }

};