import Wallet from "../models/Wallet";
import CallSession from "../models/CallSession";

const RATE_PER_SECOND = 0.001;
const MIN_CALL_SECONDS = 10; // anti-fraud

export const processCallEarning = async (sessionId: string) => {
  try {
    const session = await CallSession.findOne({ sessionId });

    if (!session) return;

    /* ❌ FRAUD FILTER */
    if (!session.durationSeconds || session.durationSeconds < MIN_CALL_SECONDS) {
      session.status = "rejected";
      session.reason = "Too short";
      await session.save();
      return;
    }

    /* 💰 CALCULATE */
    const earnings = session.durationSeconds * RATE_PER_SECOND;

    session.creditedATC = earnings;
    await session.save();

    /* 💰 UPDATE WALLET */
    await Wallet.findOneAndUpdate(
      { userId: session.userId },
      {
        $inc: {
          balanceATC: earnings,
          totalEarnedATC: earnings,
          totalMinutes: session.durationSeconds / 60,
          todayMinutes: session.durationSeconds / 60,
          "dailyEarned.calls": earnings,
        },
      },
      { upsert: true }
    );

    console.log(
      `💰 ${earnings.toFixed(3)} ATC credited for ${session.durationSeconds}s`
    );

  } catch (err: any) {
    console.log("AUTO CREDIT ERROR:", err.message);
  }
};