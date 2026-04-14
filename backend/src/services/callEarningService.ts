import mongoose from "mongoose";
import CallSession from "../models/CallSession";
import { runCallFraudChecks } from "./callFraudEngine";
import { rewardEngine } from "./rewardEngine";
import { notifyUser } from "./notifyUser";
import { emitAdminEvent, pushMinutes } from "../sockets/socket";

const MIN_DURATION = 30;

export const processCallEarning = async (sessionId: string, app?: any) => {
  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();

    /* ================= LOCK SESSION ================= */
    const session = await CallSession.findOneAndUpdate(
      {
        sessionId,
        status: { $in: ["active", "processing"] }, // ✅ FIXED
      },
      {
        status: "processing",
      },
      { new: true, session: mongoSession }
    );

    if (!session) {
      console.log("⚠️ Already processed:", sessionId);
      await mongoSession.abortTransaction();
      return;
    }

    /* ================= DUPLICATE GUARD ================= */
    if (session.creditedMinutes > 0) {
      console.log("⚠️ Already rewarded:", sessionId);
      await mongoSession.abortTransaction();
      return;
    }

    const duration = session.durationSeconds || 0;

    /* ================= REJECT SHORT ================= */
    if (duration < MIN_DURATION) {
      session.status = "rejected";
      await session.save({ session: mongoSession });

      await mongoSession.commitTransaction();

      emitAdminEvent("CALL_REJECTED", {
        sessionId,
        reason: "SHORT_CALL",
        duration,
      });

      return;
    }

    /* ================= FRAUD CHECK ================= */
    const fraud = await runCallFraudChecks({
      userId: session.userId,
      duration,
      phoneNumber: session.phoneNumber,
    });

    if (fraud.blocked) {
      session.status = "fraud";
      session.trustScore = fraud.risk || 0;

      await session.save({ session: mongoSession });
      await mongoSession.commitTransaction();

      emitAdminEvent("FRAUD_ALERT", {
        userId: session.userId,
        type: fraud.reason || "FRAUD",
        risk: fraud.risk,
        sessionId,
      });

      return;
    }

    /* ================= CALCULATE ================= */
    const minutes = Math.floor(duration / 60); // ✅ simple safe logic

    if (minutes <= 0) {
      session.status = "rejected";
      await session.save({ session: mongoSession });

      await mongoSession.commitTransaction();

      emitAdminEvent("CALL_REJECTED", {
        sessionId,
        reason: "NO_REWARD",
      });

      return;
    }

    /* ================= SAVE SESSION ================= */
    session.creditedMinutes = minutes;
    session.status = "completed";
    session.endedAt = new Date();

    await session.save({ session: mongoSession });

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    console.log("💰 Minutes ready:", minutes);

    /* ================= REWARD ENGINE ================= */
    const reward = await rewardEngine({
      userId: session.userId.toString(),
      minutes,
      source: "CALL_SESSION",
      meta: { sessionId },
    });

    /* ================= SOCKET ================= */
    pushMinutes(session.userId.toString(), minutes, {
      type: "CALL",
      sessionId,
    });

    /* ================= ADMIN ================= */
    emitAdminEvent("ADMIN_ANALYTICS_UPDATE", {
      type: "CALL_EARNING",
      userId: session.userId,
      minutes,
      sessionId,
      risk: fraud.risk || 0,
    });

    /* ================= NOTIFY ================= */
    if (app) {
      await notifyUser(
        app,
        session.userId,
        "Call Reward",
        `You earned ${minutes} minutes 🎉`,
        { minutes }
      );
    }

    return reward;

  } catch (err: any) {
    await mongoSession.abortTransaction();
    mongoSession.endSession();

    console.error("❌ EARNING ERROR:", err);

    /* 🔥 RECOVERY */
    await CallSession.findOneAndUpdate(
      { sessionId, status: "processing" },
      { status: "active" }
    );

    emitAdminEvent("SYSTEM_ERROR", {
      type: "CALL_EARNING_FAILED",
      sessionId,
      error: err.message,
    });
  }
};