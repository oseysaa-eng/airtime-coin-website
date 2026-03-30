// socket/callEngine.ts
import CallSession from "../models/CallSession";

export const registerCallHandlers = (io, socket) => {
  const userId = socket.userId;

  /* =========================
     CALL START
  ========================= */
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

  /* =========================
     CALL END
  ========================= */
  socket.on("call_end", async ({ sessionId, duration }) => {
    try {
      if (!sessionId) return;

      const session = await CallSession.findOne({ sessionId });

      if (!session) {
        console.log("⚠️ Session not found");
        return;
      }

      // 🚫 Already processed
      if (session.status !== "pending") {
        console.log("⚠️ Duplicate end ignored");
        return;
      }

      session.durationSeconds = duration;
      session.endedAt = new Date();

      await session.save();

      console.log("✅ CALL END UPDATED", sessionId);

    } catch (e) {
      console.error("CALL END ERROR:", e);
    }
  });
};