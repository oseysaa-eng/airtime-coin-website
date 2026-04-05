import CallSession from "../models/CallSession";
import { processCallEarning } from "../services/callEarningService";

/* =========================
   MEMORY TRACKING (FAST VALIDATION)
========================= */
const activeSessions = new Map<string, number>(); // sessionId → start timestamp

export const registerCallHandlers = (socket: any) => {
  const userId = socket.userId;

  /* =========================
     CALL START
  ========================= */
  socket.on("call_start", async ({ sessionId, number, timestamp }) => {
    try {
      if (!sessionId || !number) return;

      const startTime = timestamp || Date.now();

      // 🔥 Save in memory (fast validation later)
      activeSessions.set(sessionId, startTime);

      await CallSession.findOneAndUpdate(
        { sessionId },
        {
          userId,
          phoneNumber: number,
          status: "pending",
          startedAt: new Date(startTime),
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

      /* =========================
         VALIDATE SESSION
      ========================= */
      const startTime = activeSessions.get(sessionId);

      if (!startTime) {
        console.log("⚠️ Unknown session (possible fraud):", sessionId);
      }

      // remove from memory (prevent reuse)
      activeSessions.delete(sessionId);

      /* =========================
         SAFE DURATION CALCULATION
      ========================= */

      const clientDuration = duration || 0;

      // server-trusted duration
      const serverDuration = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : clientDuration;

      // choose safest
      let safeDuration = Math.min(clientDuration, serverDuration);

      // clamp (0 → 2hrs)
      safeDuration = Math.max(0, Math.min(safeDuration, 7200));

      /* =========================
         LOAD SESSION
      ========================= */
      let session = await CallSession.findOne({ sessionId });

      // 🔥 EDGE CASE: END before START saved
      if (!session) {
        session = await CallSession.create({
          sessionId,
          userId,
          status: "pending",
          startedAt: new Date(Date.now() - safeDuration * 1000),
        });
      }

      /* =========================
         DUPLICATE PROTECTION
      ========================= */
      if (session.status !== "pending") {
        console.log("⚠️ Duplicate end ignored:", sessionId);
        return;
      }

      /* =========================
         FRAUD RULES
      ========================= */

      // 🚫 Ignore very short calls
      if (safeDuration < 5) {
        session.status = "rejected";
        session.durationSeconds = safeDuration;
        session.endedAt = new Date();
        await session.save();

        console.log("🚫 Call too short → rejected");
        return;
      }

      /* =========================
         UPDATE SESSION
      ========================= */
      session.durationSeconds = safeDuration;
      session.endedAt = new Date();
      session.status = "completed";

      await session.save();

      console.log("✅ CALL END UPDATED", sessionId, safeDuration + "s");

      /* =========================
         💰 PROCESS EARNINGS
      ========================= */
      await processCallEarning(sessionId);

    } catch (e) {
      console.error("CALL END ERROR:", e);
    }
  });

  /* =========================
     DISCONNECT CLEANUP
  ========================= */
  socket.on("disconnect", () => {
    // optional cleanup (if needed)
    console.log("🔴 Socket disconnected:", socket.id);
  });
};