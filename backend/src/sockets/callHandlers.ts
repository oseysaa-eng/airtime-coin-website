import CallSession from "../models/CallSession";
import { processCallEarning } from "../services/callEarningService";

export const registerCallHandlers = (socket: any) => {

  /* ================================
     CALL START
  ================================= */
  socket.on("call_start", async (data: any) => {
    try {
      if (!data?.sessionId || !data?.number) {
        console.log("❌ Invalid call_start payload");
        return;
      }

      await CallSession.create({
        sessionId: data.sessionId,
        userId: socket.userId,
        phoneNumber: data.number,
        startTime: new Date(),
      });

      console.log("✅ Call session started:", data.sessionId);

    } catch (err: any) {
      console.log("START ERROR:", err.message);
    }
  });

  /* ================================
     CALL END
  ================================= */
  socket.on("call_end", async (data: any) => {
    try {
      if (!data?.sessionId) return;

      const session = await CallSession.findOneAndUpdate(
        { sessionId: data.sessionId },
        {
          endTime: new Date(),
          durationSeconds: data.duration || 0,
        },
        { new: true }
      );

      if (session) {
        await processCallEarning(data.sessionId);
      }

      console.log("✅ Call session ended:", data.sessionId);

    } catch (err: any) {
      console.log("END ERROR:", err.message);
    }
  });

};