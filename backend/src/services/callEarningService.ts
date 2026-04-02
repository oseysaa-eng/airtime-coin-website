import CallSession from "../models/CallSession";
import { runCallFraudChecks } from "./callFraudEngine";
import { calculateCallReward } from "./callRewardService";
import { creditUser } from "./creditService";
import { notifyUser } from "./notifyUser";
import { emitAdminEvent, pushMinutes } from "../sockets/socket";

const MIN_DURATION = 30; // seconds

export const processCallEarning = async (sessionId: string, app?: any) => {
  try {
    const session = await CallSession.findOne({ sessionId });

    // ✅ SAFETY: avoid duplicates
    if (!session || session.status === "completed") return;

    const duration = session.durationSeconds || 0;

    /* ================= REJECT SHORT ================= */
    if (duration < MIN_DURATION) {
      session.status = "rejected";
      await session.save();

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
      session.status = "blocked";
      session.flagged = true;
      session.riskScore = fraud.risk || 0;
      await session.save();

      console.log("🚫 Fraud blocked:", fraud.reason);

      // 🔥 ADMIN ALERT
      emitAdminEvent("FRAUD_ALERT", {
        userId: session.userId,
        type: fraud.reason || "FRAUD_DETECTED",
        risk: fraud.risk,
        sessionId,
      });

      return;
    }

    /* ================= REWARD ================= */
    const minutes = calculateCallReward(duration);

    if (minutes <= 0) {
      session.status = "rejected";
      await session.save();

      emitAdminEvent("CALL_REJECTED", {
        sessionId,
        reason: "NO_REWARD",
      });

      return;
    }

    /* ================= CREDIT ================= */
    const credit = await creditUser(session.userId, minutes, "CALL");

    /* ================= UPDATE SESSION ================= */
    session.status = "completed";
    session.minutes = minutes;
    session.riskScore = fraud.risk || 0;
    session.endedAt = new Date();
    await session.save();

    console.log("💰 Minutes credited:", minutes);

    /* ================= REALTIME PUSH (USER APP) ================= */
    pushMinutes(session.userId.toString(), minutes, {
      type: "CALL",
      sessionId,
    });

    /* ================= ADMIN LIVE UPDATE ================= */
    emitAdminEvent("ADMIN_ANALYTICS_UPDATE", {
      type: "CALL_EARNING",
      userId: session.userId,
      minutes,
      sessionId,
      risk: fraud.risk || 0,
    });

    /* ================= NOTIFY USER ================= */
    if (app) {
      await notifyUser(
        app,
        session.userId,
        "Call Reward",
        `You earned ${minutes} minutes 🎉`,
        { minutes }
      );
    }

  } catch (err) {
    console.error("EARNING ERROR:", err);

    // 🔥 ADMIN ERROR VISIBILITY
    emitAdminEvent("SYSTEM_ERROR", {
      type: "CALL_EARNING_FAILED",
      sessionId,
      error: err.message,
    });
  }
};