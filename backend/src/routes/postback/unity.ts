import express from "express";
import auth from "../../middleware/authMiddleware";
import { creditUser } from "../../services/creditService";

const router = express.Router();

/**
 * Unity TEST reward (no secrets yet)
 */
router.post("/reward", auth, async (req: any, res) => {
  try {
    const minutes = Number(req.body.minutes || 5);

    const result = await creditUser(
      req.user.id,
      minutes,
      "UNITY",
      { test: true }
    );

    res.json({
      success: true,
      message: "Unity test reward credited",
      ...result,
    });

  } catch (e) {
    console.error("UNITY ERROR:", e);
    res.status(500).json({ message: "Unity reward failed" });
  }
});

export default router;
