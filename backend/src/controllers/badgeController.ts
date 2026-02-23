import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import User from "../models/User";

export const getBadgeInfo = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(400).json({ message: "Invalid user" });

    const user = await User.findById(userId).select(
      "name donorBadge totalDonations badge"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      badge: user.badge || "New User",
      donorBadge: user.donorBadge || "None",
      totalDonations: user.totalDonations || 0,
      name: user.name || "",
    });
  } catch (err) {
    console.error("Badge Fetch Error:", err);
    return res.status(500).json({ message: "Server error fetching badge info" });
  }
};
