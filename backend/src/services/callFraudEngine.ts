import CallSession from "../models/CallSession";
import FraudEvent from "../models/FraudEvent";
import UserTrust from "../models/UserTrust";

export const runCallFraudChecks = async ({
  userId,
  duration,
  phoneNumber
}: any) => {

  let risk = 0;

  /* --------------------------------
     1. SHORT CALL LOOP DETECTION
  -------------------------------- */

  if (duration < 60) {

    const recentShortCalls = await CallSession.countDocuments({
      userId,
      durationSeconds: { $lt: 60 },
      createdAt: {
        $gte: new Date(Date.now() - 10 * 60 * 1000)
      }
    });

    if (recentShortCalls > 5) {

      risk += 30;

      await FraudEvent.create({
        userId,
        type: "CALL_LOOP",
        severity: "high",
        message: "Multiple short call loops detected"
      });

    }

  }

  /* --------------------------------
     2. SAME NUMBER FARMING
  -------------------------------- */

  if (phoneNumber) {

    const sameNumberCalls = await CallSession.countDocuments({
      userId,
      phoneNumber,
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    });

    if (sameNumberCalls > 10) {

      risk += 25;

      await FraudEvent.create({
        userId,
        type: "SAME_NUMBER_ABUSE",
        severity: "high",
        message: "Repeated calls to same number"
      });

    }

  }

  /* --------------------------------
     3. HIGH FREQUENCY CALLS
  -------------------------------- */

  const recentCalls = await CallSession.countDocuments({
    userId,
    createdAt: {
      $gte: new Date(Date.now() - 10 * 60 * 1000)
    }
  });

  if (recentCalls > 20) {

    risk += 40;

    await FraudEvent.create({
      userId,
      type: "HIGH_FREQUENCY_CALLS",
      severity: "critical",
      message: "Unusual call frequency detected"
    });

  }

  /* --------------------------------
     TRUST SCORE UPDATE
  -------------------------------- */

  const trust = await UserTrust.findOneAndUpdate(
    { userId },
    { $inc: { score: -risk } },
    { new: true, upsert: true }
  );

  /* --------------------------------
     BLOCK CONDITION
  -------------------------------- */

  if (trust.score < 40) {

    return {
      blocked: true,
      reason: "TRUST_LOW"
    };

  }

  return {
    blocked: false,
    risk,
    trustScore: trust.score
  };

};