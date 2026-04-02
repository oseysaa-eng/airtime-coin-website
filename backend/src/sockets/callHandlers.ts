import CallSession from "../models/CallSession";
import { processCallEarning } from "../services/callEarningService";

export const registerCallHandlers = (socket: any) => {

  const userId = socket.userId;

  /* ================= CALL START ================= */
  socket.on("call_start", async ({ sessionId, number }) => {
    try {
      if (!sessionId) return;

      await CallSession.findOneAndUpdate(
        { sessionId },
        {
          userId,
          phoneNumber: number,
          status: "pending",
          startedAt: new Date(),
        },
        { upsert: true }
      );

      console.log("✅ CALL START SAVED", sessionId);

    } catch (e) {
      console.error("CALL START ERROR:", e);
    }
  });

  /* ================= CALL END ================= */
  socket.on("call_end", async ({ sessionId, duration }) => {
    try {
      if (!sessionId) return;

      const session = await CallSession.findOne({ sessionId });

      if (!session) return;

      if (session.status !== "pending") return;

      session.durationSeconds = duration;
      session.endedAt = new Date();
      await session.save();

      console.log("✅ CALL END UPDATED", sessionId);

      // 💰 TRIGGER EARNING ENGINE
      await processCallEarning(sessionId.app);

    } catch (e) {
      console.error("CALL END ERROR:", e);
    }
  });
};