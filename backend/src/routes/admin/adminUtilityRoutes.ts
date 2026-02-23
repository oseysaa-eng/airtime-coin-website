import express from "express";
import adminAuth from "../../middleware/adminAuth";
import Transaction from "../../models/Transaction";
import Treasury from "../../models/Treasury";
import UtilityPool from "../../models/UtilityPool";
import {
  getRecentUtilityTx,
  getUtilityBreakdown,
  getUtilityOverview,
} from "../../services/utilityAnalyticsService";


const router = express.Router();


/**
 * GET /api/admin/utility
 * View all utility pools
 */
router.get("/", adminAuth, async (_req, res) => {
  const pools = await UtilityPool.find();
  res.json(pools);
});

/**
 * POST /api/admin/utility/:utility
 * Update rate, pause, daily limits
 */
router.post("/:utility", adminAuth, async (req, res) => {
  const { utility } = req.params;
  const { rate, paused, dailyLimitATC } = req.body;

  const pool =
    (await UtilityPool.findOne({ utility })) ||
    (await UtilityPool.create({ utility, rate: rate ?? 1 }));

  if (rate !== undefined) pool.rate = rate;
  if (paused !== undefined) pool.paused = paused;
  if (dailyLimitATC !== undefined)
    pool.dailyLimitATC = dailyLimitATC;

  await pool.save();

  res.json({
    success: true,
    pool,
  });
});



/**
 * GET /api/admin/utilities/dashboard
 */
router.get("/dashboard", adminAuth, async (_req, res) => {
  const totalSpent = await Transaction.aggregate([
    { $match: { type: "UTILITY", status: "SUCCESS" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const byUtility = await Transaction.aggregate([
    { $match: { type: "UTILITY", status: "SUCCESS" } },
    {
      $group: {
        _id: "$source",
        count: { $sum: 1 },
        atc: { $sum: "$amount" },
      },
    },
  ]);

  const pools = await UtilityPool.find();

  const treasury = await Treasury.findOne();

  res.json({
    totalATCSpent: totalSpent[0]?.total || 0,
    byUtility,
    pools,
    treasury,
  });
});



/**
 * POST /api/admin/utility/:utility/refill
 */
router.post("/:utility/refill", adminAuth, async (req, res) => {
  const { utility } = req.params;
  const { amountATC } = req.body;

  if (!amountATC || amountATC <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const pool = await UtilityPool.findOne({ utility });
  if (!pool) {
    return res.status(404).json({ message: "Pool not found" });
  }

  pool.balanceATC += amountATC;
  await pool.save();

  res.json({
    success: true,
    newBalance: pool.balanceATC,
  });
});

/**
 * GET /api/admin/utility/overview
 */
router.get("/overview", adminAuth, async (_req, res) => {
  res.json(await getUtilityOverview());
});

/**
 * GET /api/admin/utility/breakdown
 */
router.get("/breakdown", adminAuth, async (_req, res) => {
  res.json(await getUtilityBreakdown());
});

/**
 * GET /api/admin/utility/recent
 */
router.get("/recent", adminAuth, async (_req, res) => {
  res.json(await getRecentUtilityTx());
});

export default router;