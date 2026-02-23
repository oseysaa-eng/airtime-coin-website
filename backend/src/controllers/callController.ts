import { Response } from "express";
import CallSession from "../models/CallSession";
import { creditReward } from "../services/rewardService";

/**
 * START CALL SESSION
 */
export const startCall = async (req: any, res: Response) => {
  const session = await CallSession.create({
    userId: req.user.id,
    startedAt: new Date(),
  });

  res.json({ sessionId: session._id });
};

/**
 * END CALL SESSION
 */
export const endCall = async (req: any, res: Response) => {
  const { sessionId } = req.body;

  const session = await CallSession.findById(sessionId);
  if (!session || session.rewarded) {
    return res.status(400).json({ message: "Invalid session" });
  }

  const endedAt = new Date();
  const durationSeconds =
    (endedAt.getTime() - session.startedAt.getTime()) / 1000;

  if (durationSeconds < 60) {
    return res.status(400).json({
      message: "Minimum call duration is 1 minute",
    });
  }

  const minutesEarned = Math.floor(durationSeconds / 60);

  // CREDIT VIA REWARD ENGINE
  await creditReward({
    userId: session.userId.toString(),
    source: "CALL_SESSION",
    minutes: minutesEarned,
    meta: { durationSeconds },
  });

  session.endedAt = endedAt;
  session.durationSeconds = durationSeconds;
  session.rewarded = true;
  await session.save();

  res.json({
    creditedMinutes: minutesEarned,
  });
};
