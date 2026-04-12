import { Response } from "express";
import mongoose from "mongoose";
import CallSession from "../models/CallSession";
import { rewardEngine } from "../services/rewardEngine";

/**
 * START CALL SESSION
 */
export const startCall = async (req: any, res: Response) => {
  try {
    const session = await CallSession.create({
      userId: req.user.id,
      startedAt: new Date(),
      status: "active",
    });

    res.json({ sessionId: session._id });

  } catch (err) {
    console.error("START CALL ERROR:", err);
    res.status(500).json({ message: "Failed to start call" });
  }
};


/**
 * END CALL SESSION (SAFE + ATOMIC)
 */
export const endCall = async (req: any, res: Response) => {
  const sessionDB = await mongoose.startSession();
  sessionDB.startTransaction();

  try {
    const userId = req.user.id;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: "Missing sessionId" });
    }

    /* ================= LOCK SESSION ================= */
    const session = await CallSession.findOneAndUpdate(
      {
        _id: sessionId,
        userId,
        rewarded: { $ne: true }, // 🔥 prevents double reward
      },
      { $set: { status: "processing" } },
      { new: true, session: sessionDB }
    );

    if (!session) {
      await sessionDB.abortTransaction();
      return res.status(400).json({ message: "Invalid or already processed session" });
    }

    const endedAt = new Date();
    const durationSeconds =
      (endedAt.getTime() - session.startedAt.getTime()) / 1000;

    if (durationSeconds < 60) {
      await sessionDB.abortTransaction();
      return res.status(400).json({
        message: "Minimum call duration is 1 minute",
      });
    }

    const minutesEarned = Math.floor(durationSeconds / 60);

    /* ================= COMMIT SESSION FIRST ================= */
    session.endedAt = endedAt;
    session.durationSeconds = durationSeconds;
    session.rewarded = true;

    await session.save({ session: sessionDB });

    await sessionDB.commitTransaction();
    sessionDB.endSession();

    /* ================= 🔥 REWARD ENGINE (OUTSIDE TX) ================= */
    const io = req.app.get("io");
    await rewardEngine({
  userId: session.userId.toString(),
  minutes: minutesEarned,
  source: "CALL_SESSION",
  meta: { durationSeconds },
});

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      creditedMinutes: minutesEarned,
    });

  } catch (err) {
    await sessionDB.abortTransaction();
    sessionDB.endSession();

    console.error("END CALL ERROR:", err);

    res.status(500).json({
      message: "Failed to process call reward",
    });
  }
};