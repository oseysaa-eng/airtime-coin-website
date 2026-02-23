import CallSession from "../models/CallSession";
import UserTrust from "../models/UserTrust";

/* ======================================================
   FRAUD OVERVIEW
====================================================== */
export async function getFraudOverview() {
  const totalCalls = await CallSession.countDocuments();

  const flaggedCalls = await CallSession.countDocuments({
    flagged: true,
  });

  const riskyCalls = await CallSession.countDocuments({
    riskScore: { $gte: 60 },
  });

  const trustedUsers = await UserTrust.countDocuments({
    score: { $gte: 80 },
  });

  return {
    totalCalls,
    flaggedCalls,
    riskyCalls,
    trustedUsers,
  };
}

/* ======================================================
   FRAUD TIMELINE (LAST 14 DAYS)
====================================================== */
export async function getFraudTimeline() {
  const days = 14;
  const today = new Date();

  const data = [];

  for (let i = days; i >= 0; i--) {
    const from = new Date(today);
    from.setDate(today.getDate() - i);

    const to = new Date(from);
    to.setDate(from.getDate() + 1);

    const flagged = await CallSession.countDocuments({
      flagged: true,
      createdAt: { $gte: from, $lt: to },
    });

    data.push({
      date: from.toISOString().substring(0, 10),
      flagged,
    });
  }

  return data;
}

/* ======================================================
   RISKY USERS
====================================================== */
export async function getRiskyUsers() {
  const risky = await UserTrust.find({
    score: { $lte: 40 },
  })
    .populate("userId", "email")
    .sort({ score: 1 })
    .limit(20);

  return risky.map(t => ({
    userId: t.userId?._id,
    email: (t.userId as any)?.email,
    trustScore: t.score,
  }));
}

/* ======================================================
   FRAUD HEATMAP (BY HOUR)
====================================================== */
export async function getFraudHeatmap() {
  const sessions = await CallSession.aggregate([
    {
      $match: {
        flagged: true,
      },
    },
    {
      $project: {
        hour: { $hour: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$hour",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return sessions.map(s => ({
    hour: s._id,
    count: s.count,
  }));
}