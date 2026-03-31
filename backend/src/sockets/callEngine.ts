// socket/callEngine.ts

import CallSession from "../models/CallSession";
import { processCallEarning } from "../services/callEarningService";

export const registerCallHandlers = (socket: any) => {

  const userId = socket.userId;

  /* =========================
     CALL START
  ========================= */
  socket.on("call_start", async ({ sessionId, number }) => {
    try {
      if (!sessionId || !number) return;

      await CallSession.findOneAndUpdate(
        { sessionId },
        {
          userId,
          phoneNumber: number,
          status: "pending",
          startedAt: new Date(),
        },
        { upsert: true, new: true }
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

      // ✅ sanitize duration
      const safeDuration = Math.max(0, Math.min(duration || 0, 7200)); // max 2hrs

      let session = await CallSession.findOne({ sessionId });

      // 🔥 HANDLE EDGE CASE (end before start saved)
      if (!session) {
        session = await CallSession.create({
          sessionId,
          userId,
          status: "pending",
          startedAt: new Date(Date.now() - safeDuration * 1000),
        });
      }

      // 🚫 prevent duplicate processing
      if (session.status !== "pending") {
        console.log("⚠️ Duplicate end ignored:", sessionId);
        return;
      }

      // ✅ update session
      session.durationSeconds = safeDuration;
      session.endedAt = new Date();
      session.status = "completed";

      await session.save();

      console.log("✅ CALL END UPDATED", sessionId);

      /* =========================
         💰 PROCESS EARNINGS
      ========================= */
      await processCallEarning(sessionId);

    } catch (e) {
      console.error("CALL END ERROR:", e);
    }
  });

};