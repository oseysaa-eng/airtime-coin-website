import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import User from "../models/User";

const router = express.Router();

// Save a push token for the current user
router.post("/register", authMiddleware, async (req: any, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    const u = await User.findById(req.user.id);
    if (!u) return res.status(404).json({ message: "User not found" });

    u.pushTokens = u.pushTokens || [];
    if (!u.pushTokens.includes(token)) u.pushTokens.push(token);

    await u.save();
    return res.json({ success: true });
  } catch (err) {
    console.error("push register error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
