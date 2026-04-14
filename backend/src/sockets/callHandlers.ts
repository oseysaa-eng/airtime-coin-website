import CallSession from "../models/CallSession";
import { processCallReward } from "../services/callRewardService";

export const registerCallHandlers = (socket: any) => {
  const userId = socket.userId;

  if (!userId) {
    console.log("❌ No userId in socket");
    return;
  }

  /* ================= CALL START ================= */
  socket.on("call_start", async ({ sessionId, number }) => {
    try {
      if (!sessionId) return;

      await CallSession.findOneAndUpdate(
        { sessionId },
        {
          $setOnInsert: {
            userId,
            sessionId,
            phoneNumber: number,
            startedAt: new Date(),
            status: "active", // ✅ FIXED
          },
        },
        { upsert: true, new: true }
      );

      console.log("✅ CALL START:", sessionId);
    } catch (e) {
      console.error("❌ CALL START ERROR:", e);
    }
  });

  /* ================= CALL END ================= */
  socket.on("CALL_ENDED", async (data: any) => {
    try {
      const { sessionId, duration } = data;

      if (!sessionId) return;

      console.log("📞 CALL ENDED:", sessionId, duration);

      /* ================= FETCH SESSION ================= */
      const session = await CallSession.findOne({
        sessionId,
        userId, // ✅ SECURITY FIX
      });

      if (!session) {
        console.warn("⚠️ Session not found");
        return;
      }

      /* ================= DUPLICATE GUARD ================= */
      if (session.status === "completed") {
        console.log("⚠️ Already completed:", sessionId);
        return;
      }

      if (session.status === "processing") {
        console.log("⚠️ Already processing:", sessionId);
        return;
      }

      /* ================= VALIDATE DURATION ================= */
      const safeDuration = Math.max(0, Number(duration) || 0);

      /* ================= UPDATE SESSION ================= */
      session.durationSeconds = safeDuration;
      session.endedAt = new Date();
      session.status = "processing"; // 🔒 LOCK

      await session.save();

      /* ================= PROCESS REWARD ================= */
      const result = await processCallReward(sessionId);

      console.log("🎯 Call reward result:", result);

    } catch (err) {
      console.error("❌ CALL END ERROR:", err);
    }
  });
};