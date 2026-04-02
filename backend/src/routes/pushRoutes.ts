import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import User from "../models/User";

const router = express.Router();

router.post("/register", authMiddleware, async (req: any, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.pushTokens.includes(token)) {
      user.pushTokens.push(token);
    }

    await user.save();

    console.log("📲 Token saved:", token);

    res.json({ success: true });

  } catch (err) {
    console.error("push register error", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;