import mongoose from "mongoose";
import CallSession from "../models/CallSession";
import UserTrust from "../models/UserTrust"; // ✅ FIXED
import { runCallFraudChecks } from "./callFraudEngine";
import { rewardEngine } from "./rewardEngine";
import { notifyUser } from "./notifyUser";
import { emitAdminEvent, pushMinutes } from "../sockets/socket";

const MIN_DURATION = 60;

export const processCallEarning = async (sessionId: string, app?: any) => {
  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();

    /* ================= LOCK SESSION ================= */
    const session = await CallSession.findOneAndUpdate(
      {
        sessionId,
        status: { $in: ["active", "processing"] },
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

    /* ================= TRUST (OUTSIDE TRANSACTION) ================= */
    await mongoSession.commitTransaction(); // ✅ release lock early

    const trust = await UserTrust.findOne({ userId: session.userId });
    const trustScore = trust?.score ?? 100;

    /* ================= CALCULATE ================= */
    const emissionMultiplier = 1;

    const baseMinutes = Math.min(
      Math.floor(duration / 60),
      5
    );

    let trustMultiplier = 1;
    if (trustScore < 80) trustMultiplier = 0.7;
    if (trustScore < 60) trustMultiplier = 0.4;
    if (trustScore < 40) trustMultiplier = 0;

    const minutes = Math.floor(
      baseMinutes * trustMultiplier * emissionMultiplier
    );

    if (minutes <= 0) {
      await CallSession.updateOne(
        { sessionId },
        { status: "rejected" }
      );

      emitAdminEvent("CALL_REJECTED", {
        sessionId,
        reason: "NO_REWARD",
      });

      return;
    }

    /* ================= FINAL UPDATE ================= */
    await CallSession.updateOne(
      { sessionId },
      {
        creditedMinutes: minutes,
        status: "completed",
        endedAt: new Date(),
      }
    );

    console.log("💰 Minutes ready:", minutes);

    /* ================= REWARD ENGINE ================= */
    if (minutes > 10) {
      console.warn("⚠️ Suspicious high minutes:", minutes);
    }

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