import CallSession from "../models/CallSession";
import { processCallEarning } from "../services/callEarningService";

export const registerCallHandlers = (socket: any) => {
  const userId = socket.userId;

  if (!userId) {
    console.log("❌ No userId in socket");
    socket.disconnect();
    return;
  }

  /* ================= CALL START ================= */
  socket.on("call_start", async ({ sessionId, number }) => {
    try {
      if (!sessionId) return;

      await CallSession.findOneAndUpdate(
        { sessionId },
        {
          userId,
          phoneNumber: number || "unknown",
          status: "pending",
          startedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log("✅ CALL START SAVED:", sessionId);

    } catch (e) {
      console.error("❌ CALL START ERROR:", e);
    }
  });

  /* ================= CALL END ================= */
  socket.on("call_end", async ({ sessionId, duration }) => {
    try {
      if (!sessionId) return;

      // 🔒 Validate duration
      const durationSeconds = Number(duration);
      if (!durationSeconds || durationSeconds < 5) {
        console.log("⚠️ Call too short, ignored:", durationSeconds);
        return;
      }

      const session = await CallSession.findOne({ sessionId });

      if (!session) {
        console.log("❌ Session not found:", sessionId);
        return;
      }

      // 🔒 Prevent duplicate processing
      if (session.status !== "pending") {
        console.log("⚠️ Already processed:", sessionId);
        return;
      }

      // 🔒 Ensure correct user
      if (session.userId.toString() !== userId) {
        console.log("❌ User mismatch:", sessionId);
        return;
      }

      session.durationSeconds = durationSeconds;
      session.endedAt = new Date();
      session.status = "completed";

      await session.save();

      console.log("✅ CALL END UPDATED:", sessionId);

      // 💰 TRIGGER EARNING ENGINE
      await processCallEarning(sessionId);

    } catch (e) {
      console.error("❌ CALL END ERROR:", e);
    }
  });

  /* ================= FAILSAFE (AUTO END) ================= */
  socket.on("disconnect", async () => {
    try {
      console.log("⚠️ Socket disconnected, checking active calls...");

      const activeSessions = await CallSession.find({
        userId,
        status: "pending",
      });

      for (const session of activeSessions) {
        const duration =
          (Date.now() - new Date(session.startedAt).getTime()) / 1000;

        if (duration > 10) {
          session.durationSeconds = Math.floor(duration);
          session.endedAt = new Date();
          session.status = "completed";

          await session.save();

          console.log("🔄 Auto-ended call:", session.sessionId);

          await processCallEarning(session.sessionId);
        } else {
          session.status = "failed";
          await session.save();
        }
      }

    } catch (err) {
      console.error("❌ Disconnect cleanup error:", err);
    }
  });
};