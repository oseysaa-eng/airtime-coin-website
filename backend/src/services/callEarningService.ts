import mongoose from "mongoose";
import CallSession from "../models/CallSession";
import { runCallFraudChecks } from "./callFraudEngine";
import { calculateCallReward } from "./callRewardService";
import { creditUser } from "./creditService";
import { notifyUser } from "./notifyUser";
import {
  emitAdminEvent,
  pushMinutes,
  pushWalletUpdate,
} from "../sockets/socket";

const MIN_DURATION = 30;

export const processCallEarning = async (sessionId: string, app?: any) => {
  const mongoSession = await mongoose.startSession();

  try {
    mongoSession.startTransaction();

    /* ================= LOCK SESSION ================= */
    const session = await CallSession.findOneAndUpdate(
      {
        sessionId,
        status: { $in: ["pending", "processing"] }, // 🔥 allow recovery
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

    /* ================= REWARD ================= */
    const minutes = calculateCallReward(duration);

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

    /* ================= CREDIT ================= */
    const credit = await creditUser(
      session.userId,
      minutes,
      "CALL",
      mongoSession // 🔥 pass session for atomic update
    );

    /* ================= UPDATE SESSION ================= */
    session.status = "completed";
    session.creditedMinutes = minutes;
    session.trustScore = fraud.risk || 0;
    session.endedAt = new Date();

    await session.save({ session: mongoSession });

    await mongoSession.commitTransaction();

    console.log("💰 Minutes credited:", minutes);

    /* ================= 🚀 REALTIME PUSH ================= */

    const safePayload = {
      balance: credit?.balance ?? 0,
      minutes: credit?.minutes ?? 0,
      atc: credit?.atc ?? 0,
    };

    // 🔥 Wallet sync
    pushWalletUpdate(session.userId.toString(), safePayload);

    // 🔥 Smooth animation event
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

  } catch (err: any) {
    await mongoSession.abortTransaction();

    console.error("❌ EARNING ERROR:", err);

    // 🔥 RECOVERY: reset stuck session
    await CallSession.findOneAndUpdate(
      { sessionId, status: "processing" },
      { status: "pending" }
    );

    emitAdminEvent("SYSTEM_ERROR", {
      type: "CALL_EARNING_FAILED",
      sessionId,
      error: err.message,
    });

  } finally {
    mongoSession.endSession();
  }
};