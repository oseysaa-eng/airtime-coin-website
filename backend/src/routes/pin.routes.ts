import express from "express";
import auth from "../middleware/authMiddleware";
import WithdrawalPin from "../models/WithdrawalPin";
import { comparePin, hashPin } from "../utils/pinHash";

const router = express.Router();

/**
 * SET PIN
 */
router.post("/set", auth, async (req: any, res) => {
  const { pin } = req.body;

  if (!pin || pin.length !== 4) {
    return res
      .status(400)
      .json({ message: "PIN must be 4 digits" });
  }

  const hash = await hashPin(pin);

  await WithdrawalPin.findOneAndUpdate(
    { userId: req.user.id },
    {
      pinHash: hash,
      attempts: 0,
      lockedUntil: null,
    },
    { upsert: true }
  );

  res.json({ success: true });
});

/**
 * CHANGE PIN
 */
router.post("/change", auth, async (req: any, res) => {
  const { oldPin, newPin } = req.body;

  const record = await WithdrawalPin.findOne({
    userId: req.user.id,
  });

  if (!record) {
    return res
      .status(404)
      .json({ message: "PIN not set" });
  }

  const ok = await comparePin(
    oldPin,
    record.pinHash
  );

  if (!ok) {
    return res
      .status(403)
      .json({ message: "Incorrect PIN" });
  }

  record.pinHash = await hashPin(newPin);
  record.attempts = 0;
  record.lockedUntil = null;
  await record.save();

  res.json({ success: true });
});

export default router;