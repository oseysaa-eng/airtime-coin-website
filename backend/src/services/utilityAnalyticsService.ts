import Transaction from "../models/Transaction";

export async function getUtilityOverview() {
  const totalSpent = await Transaction.aggregate([
    { $match: { type: "UTILITY", status: "SUCCESS" } },
    { $group: { _id: null, atc: { $sum: "$amount" } } },
  ]);

  const count = await Transaction.countDocuments({
    type: "UTILITY",
    status: "SUCCESS",
  });

  return {
    totalATCSpent: totalSpent[0]?.atc || 0,
    totalTransactions: count,
  };
}

export async function getUtilityBreakdown() {
  return Transaction.aggregate([
    { $match: { type: "UTILITY", status: "SUCCESS" } },
    {
      $group: {
        _id: "$source",
        atc: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { atc: -1 } },
  ]);
}

export async function getRecentUtilityTx() {
  return Transaction.find({ type: "UTILITY" })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
}