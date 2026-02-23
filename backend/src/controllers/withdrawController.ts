import User from "../models/User";
import Withdraw from "../models/Withdraw";

export const requestWithdraw = async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { amount, method, network, wallet, cryptoType } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    const fee = amount * 0.02;
    const netAmount = amount - fee;

    // create withdraw with pending status (do not deduct yet)
    const w = await Withdraw.create({
      userId,
      amount,
      fee,
      netAmount,
      method,
      network,
      wallet,
      cryptoType,
      status: "pending",
    });

    // emit socket event to user
    const io = req.app.get("io");
    io?.to(`user:${userId}`).emit("withdraw:update", { withdrawId: w._id, status: "pending" });

    return res.json({ success: true, withdrawId: w._id });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
