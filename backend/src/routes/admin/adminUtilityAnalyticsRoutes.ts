import express from "express";
import adminAuth from "../../middleware/adminAuth";
import Transaction from "../../models/Transaction";
import UtilityPool from "../../models/UtilityPool";

const router = express.Router();

/**
 * GET /api/admin/utility/overview
 */
router.get("/overview", adminAuth, async (_req, res) => {
  const totals = await Transaction.aggregate([
    { $match: { type: "UTILITY", status: "SUCCESS" } },
    {
      $group: {
        _id: "$source",
        totalATC: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const totalSpent = totals.reduce(
    (sum, t) => sum + t.totalATC,
    0
  );

  res.json({
    totalSpentATC: totalSpent,
    breakdown: totals,
  });
});

/**
 * GET /api/admin/utility/recent
 */
router.get("/recent", adminAuth, async (_req, res) => {
  const txs = await Transaction.find({
    type: "UTILITY",
    status: "SUCCESS",
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(txs);
});

/**
 * GET /api/admin/utility/pools
 */
router.get("/pools", adminAuth, async (_req, res) => {
  const pools = await UtilityPool.find().lean();
  res.json(pools);
});

export default router;