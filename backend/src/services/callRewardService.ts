import CallSession from "../models/CallSession";
import { rewardEngine } from "./rewardEngine";

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

    /* ================= VALIDATION ================= */
    const duration = session.durationSeconds || 0;

    if (duration < 10) {
      session.status = "rejected";
      await session.save();

      return { success: false, message: "Call too short" };
    }

    /* ================= CONVERT TO MINUTES ================= */
    const minutes = Math.floor(duration / 60);

    if (minutes <= 0) {
      session.status = "rejected";
      await session.save();

      return { success: false, message: "No rewardable minutes" };
    }

    /* ================= REWARD ================= */
    const result = await rewardEngine({
      userId: session.userId.toString(),
      minutes,
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