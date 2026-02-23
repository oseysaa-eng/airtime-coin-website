import bcrypt from "bcryptjs";
import User from "../models/User";
import Withdraw from "../models/Withdraw"; // your withdraw model
import WithdrawalPin from "../models/WithdrawalPin";

const SALT_ROUNDS = parseInt(process.env.PIN_SALT_ROUNDS || "10", 10);

export const getPin = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const doc = await WithdrawalPin.findOne({ userId });
    return res.json({ success: true, hasPin: !!doc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const savePin = async (req: any, res: any) => {
  try {
    const { pin } = req.body;
    const userId = req.user.id;

    if (!pin || typeof pin !== "string" || pin.length !== 4)
      return res.status(400).json({ message: "PIN must be 4 digits" });

    const hash = await bcrypt.hash(pin, SALT_ROUNDS);

    let doc = await WithdrawalPin.findOne({ userId });
    if (!doc) {
      doc = await WithdrawalPin.create({ userId, pinHash: hash });
    } else {
      doc.pinHash = hash;
      await doc.save();
    }

    // emit user room update
    const io = req.app.get("io");
    io?.to(`user:${userId}`).emit("pin:update", { hasPin: true });

    return res.json({ success: true, hasPin: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * Verify PIN endpoint.
 * If withdrawId is provided and PIN correct => approve withdraw and deduct balance.
 * Otherwise, just return success boolean.
 */
export const verifyPin = async (req: any, res: any) => {
  try {
    const { pin, withdrawId } = req.body;
    const userId = req.user.id;

    if (!pin || typeof pin !== "string") return res.status(400).json({ message: "PIN is required" });

    const doc = await WithdrawalPin.findOne({ userId });
    if (!doc) return res.status(404).json({ message: "PIN not set" });

    const match = await bcrypt.compare(pin, doc.pinHash);
    if (!match) return res.status(401).json({ message: "Incorrect PIN" });

    // if withdrawId provided: approve the withdraw
    if (withdrawId) {
      const withdraw = await Withdraw.findById(withdrawId);
      if (!withdraw) return res.status(404).json({ message: "Withdraw not found" });
      if (withdraw.userId.toString() !== userId.toString()) return res.status(403).json({ message: "Not authorized" });
      if (withdraw.status !== "pending") return res.status(400).json({ message: "Withdraw already processed" });

      // double-check balance
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.balance < withdraw.amount) return res.status(400).json({ message: "Insufficient balance" });

      // deduct and approve
      user.balance -= withdraw.amount;
      await user.save();

      withdraw.status = "approved";
      withdraw.approvedAt = new Date();
      await withdraw.save();

      // emit socket update to user
      const io = req.app.get("io");
      io?.to(`user:${userId}`).emit("withdraw:update", { withdrawId, status: "approved" });
      io?.to(`user:${userId}`).emit("balance:update", { balance: user.balance });

      return res.json({ success: true, withdrawId, newBalance: user.balance });
    }

    // no withdraw, just success
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
