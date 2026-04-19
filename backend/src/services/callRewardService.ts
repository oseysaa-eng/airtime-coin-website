import CallSession from "../models/CallSession";
import { rewardEngine } from "./rewardEngine";
import SystemWallet from "../models/SystemWallet";
import { resetProfitIfNewDay } from "../utils/resetDaily";

const BASE_RATE = 0.0025;

export async function processCallReward(sessionId: string) {
  try {
    const session = await CallSession.findOne({ sessionId });

    if (!session) throw new Error("Session not found");

    /* ================= DUPLICATE GUARD ================= */
    if (session.status === "completed") {
      return { success: true, duplicate: true };
    }

    if (session.status === "processing") {
      return { success: false, message: "Already processing" };
    }

    /* ================= LOCK ================= */
    session.status = "processing";
    await session.save();

    const duration = session.durationSeconds || 0;

    if (duration < 10) {
      session.status = "rejected";
      await session.save();
      return { success: false, message: "Call too short" };
    }

    /* ================= THEORETICAL ================= */
    const theoreticalMinutes = Math.floor(duration / 60);

    /* ================= APPLY CAP (REAL PROFIT SOURCE) ================= */
    const cappedMinutes = Math.min(theoreticalMinutes, 5); // 🔥 your cap

    if (cappedMinutes <= 0) {
      session.status = "rejected";
      await session.save();
      return { success: false, message: "No rewardable minutes" };
    }

    /* ================= PROFIT ================= */
    const lostMinutes = theoreticalMinutes - cappedMinutes;
    const profitATC = Number((lostMinutes * BASE_RATE).toFixed(6));

    /* ================= UPDATE SYSTEM WALLET ================= */
    if (profitATC > 0) {
      let systemWallet = await SystemWallet.findOne();

      if (!systemWallet) {
        systemWallet = await SystemWallet.create({});
      }

      await resetProfitIfNewDay(systemWallet);

      await SystemWallet.updateOne(
        { _id: systemWallet._id },
        {
          $inc: {
            totalProfitATC: profitATC,
            dailyProfitATC: profitATC,
            profitFromCalls: profitATC,
          },
        }
      );
    }

    /* ================= REWARD ================= */
    const result = await rewardEngine({
      userId: session.userId.toString(),
      minutes: cappedMinutes,
      source: "CALL_SESSION",
      meta: {
        sessionId,
        duration,
        phoneNumber: session.phoneNumber,
      },
    });

    /* ================= UPDATE SESSION ================= */
    session.creditedMinutes = result.creditedMinutes;
    session.status = "completed";
    session.processedAt = new Date();

    await session.save();

    return {
      success: true,
      minutes: result.creditedMinutes,
    };

  } catch (err) {
    console.error("❌ CALL REWARD ERROR:", err);
    throw err;
  }
}


