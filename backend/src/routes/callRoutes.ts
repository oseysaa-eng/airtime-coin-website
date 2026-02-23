import express from "express";
import { v4 as uuidv4 } from "uuid";
import auth from "../middleware/authMiddleware";
import CallSession from "../models/CallSession";
import RewardPool from "../models/RewardPool";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import UserTrust from "../models/UserTrust";
import Wallet from "../models/Wallet";
import { getPoolMultiplier } from "../services/rewardThrottleService";
import { adjustTrust, decayTrust } from "../services/trustService";
import { resetIfNewDay } from "../utils/resetDailyCounter";



const router = express.Router();

/**
 * START CALL SESSION
 */
router.post("/start", auth, async (req: any, res) => {
  const userId = req.user.id;

  const ip =
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "unknown";

  const deviceHash = req.headers["x-device-id"] || "unknown";

  const active = await CallSession.findOne({
    userId,
    status: "ACTIVE",
  });

  if (active) {
    return res.status(400).json({ message: "Call already active" });
  }

  const session = await CallSession.create({
    userId,
    sessionId: uuidv4(),
    startedAt: new Date(),
    ipAddress: ip,
    deviceHash,
    status: "ACTIVE",
  });

  res.json({ sessionId: session.sessionId });
});



router.post("/end", auth, async (req: any, res) => {
  const { sessionId } = req.body;
  const uid = req.user.id;

  const session = await CallSession.findOne({
    sessionId,
    userId: uid,
    status: "ACTIVE",
  });

  if (!session) {
    return res.status(404).json({ message: "Active session not found" });
  }

  /* ---------------- GLOBAL PAUSE ---------------- */
  const settings = await SystemSettings.findOne();
if (settings?.incidentMode?.active) {
  return res.status(403).json({
    message: "System temporarily unavailable",
    incident: settings.incidentMode.message,
  });
}

  /* ---------------- DURATION ---------------- */
  const durationSeconds = Math.floor(
    (Date.now() - session.startedAt.getTime()) / 1000
  );

  if (durationSeconds < 30) {
    session.status = "REJECTED";
    session.flagged = true;
    await adjustTrust(uid, -5, "Too short call");
    await session.save();
    return res.status(403).json({ message: "Call too short" });
  }

  const rawMinutes = Math.floor(durationSeconds / 60);
  if (rawMinutes <= 0) {
    return res.status(403).json({ message: "No rewardable minutes" });
  }

  

  /* ---------------- TRUST ---------------- */
  const trust =
    (await UserTrust.findOne({ userId: uid })) ||
    (await UserTrust.create({ userId: uid }));

  if (trust.score < 40) {
    session.status = "REJECTED";
    await session.save();
    return res.status(403).json({
      message: "Rewards blocked due to trust score",
      trustStatus: "blocked",
    });
    
  }
  
  if (call.isFlagged) {
  await decayTrust(userId, 5, "Flagged call detected");
}


  let trustMultiplier = 1;
  if (trust.score < 80) trustMultiplier = 0.8;
  if (trust.score < 60) trustMultiplier = 0.5;
  

  const trustMinutes = Math.floor(rawMinutes * trustMultiplier);

  

  /* ---------------- POOL ---------------- */
  const pool = await RewardPool.findOne({ type: "CALL" });
  if (!pool || pool.paused) {
    return res.status(403).json({ message: "Call rewards paused" });
  }

  resetIfNewDay(pool);

  const poolMultiplier = getPoolMultiplier(pool);
  if (poolMultiplier === 0) {
    return res.status(403).json({ message: "Call reward pool depleted" });
  }

  const finalMinutes = Math.floor(trustMinutes * poolMultiplier);
  if (finalMinutes <= 0) {
    return res.status(403).json({ message: "No reward after throttling" });
  }

  const atcAmount = finalMinutes * CALL_ATC_RATE;

  if (pool.spentTodayATC + atcAmount > pool.dailyLimitATC) {
    return res.status(403).json({
      message: "Call reward daily limit reached",
    });
  }

  /* ---------------- CREDIT ---------------- */
  const wallet =
    (await Wallet.findOne({ userId: uid })) ||
    (await Wallet.create({ userId: uid }));

  wallet.totalMinutes += finalMinutes;
  wallet.todayMinutes += finalMinutes;
  await wallet.save();

  pool.balanceATC -= atcAmount;
  pool.spentTodayATC += atcAmount;
  await pool.save();

  await Transaction.create({
    userId: uid,
    type: "EARN",
    amount: finalMinutes,
    source: "CALL",
    meta: { atcAmount },
  });

  session.status = "COMPLETED";
  session.creditedMinutes = finalMinutes;
  session.endedAt = new Date();
  await session.save();

  res.json({
    creditedMinutes: finalMinutes,
    throttled: poolMultiplier < 1,
  });
});


/**
 * WEEKLY CALL CHART (CallSessionScreen)
 */
router.get("/weekly", auth, async (req: any, res) => {
  const uid = req.user.id;

  const data = await CallSession.aggregate([
    {
      $match: {
        userId: uid,
        status: "COMPLETED",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        minutes: { $sum: "$creditedMinutes" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data);
});

export default router;
