import UserTrust from "../models/UserTrust";

type PenaltyInput = {
  userId: string;
  type:
    | "MULTI_DEVICE"
    | "MULTI_ACCOUNT"
    | "ABNORMAL_EARNING"
    | "RAPID_ACTIONS"
    | "SUSPICIOUS_CALL";
  meta?: any;
};

const PENALTIES: Record<string, number> = {
  MULTI_DEVICE: -10,
  MULTI_ACCOUNT: -25,
  ABNORMAL_EARNING: -15,
  RAPID_ACTIONS: -10,
  SUSPICIOUS_CALL: -5,
};

export const applyTrustPenalty = async ({
  userId,
  type,
  meta = {},
}: PenaltyInput) => {
  const penalty = PENALTIES[type] || 0;

  if (!penalty) return;

  const trust = await UserTrust.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        score: 100,
        history: [],
      },
    },
    { new: true, upsert: true }
  );

  const newScore = Math.max(0, trust.score + penalty);

  trust.score = newScore;

  // 🧾 HISTORY TRACKING
  trust.history.push({
    type,
    change: penalty,
    newScore,
    meta,
    createdAt: new Date(),
  });

  await trust.save();

  return trust;
};