import CallSession from "../models/CallSession";
import User from "../models/User";
import { pushWalletUpdate } from "../sockets/socket";

const MIN_DURATION = 10;
const RATE_PER_SECOND = 0.0025;

export const processCallEarning = async (sessionId: string) => {
  try {
    const session = await CallSession.findOne({ sessionId });
    if (!session) return;

    if (session.status === "completed") return;

    const duration = session.durationSeconds || 0;

    // 🚫 Reject short calls
    if (duration < MIN_DURATION) {
      session.status = "rejected";
      await session.save();
      return;
    }

    // 💰 Calculate earnings
    const earnings = duration * RATE_PER_SECOND;

    const user = await User.findById(session.userId);
    if (!user) return;

    user.balance += earnings;
    await user.save();

    session.earnings = earnings;
    session.status = "completed";
    await session.save();

    console.log("💰 Earnings added:", earnings);

    // 🔥 SEND TO APP
    pushWalletUpdate(session.userId, {
      balance: user.balance,
      earnings,
    });

  } catch (err) {
    console.error("EARNING ERROR:", err);
  }
};