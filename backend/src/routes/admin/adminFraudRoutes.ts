import express from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminAuditLog from "../../models/AdminAuditLog";
import CallSession from "../../models/CallSession";
import UserTrust from "../../models/UserTrust";

import {
  getFraudHeatmap,
  getFraudOverview,
  getFraudTimeline,
  getRiskyUsers,
} from "../../services/fraudAnalyticsService";

const router = express.Router();

/* ======================================================
   FRAUD DASHBOARD (SINGLE ENDPOINT)
====================================================== */

/**
 * GET /api/admin/fraud/dashboard
 */
router.get("/dashboard", adminAuth, async (_req, res) => {
  try {
    const [
      overview,
      timeline,
      users,
      heatmap,
    ] = await Promise.allSettled([
      getFraudOverview(),
      getFraudTimeline(),
      getRiskyUsers(),
      getFraudHeatmap(),
    ]);

    res.json({
      overview:
        overview.status === "fulfilled"
          ? overview.value
          : {
              flaggedCalls: 0,
              blockedDevices: 0,
              riskyUsers: 0,
              trustDrops: 0,
            },

      timeline:
        timeline.status === "fulfilled"
          ? timeline.value
          : [],

      users:
        users.status === "fulfilled"
          ? users.value
          : [],

      heatmap:
        heatmap.status === "fulfilled"
          ? heatmap.value
          : [],
    });
  } catch (err) {
    console.error("FRAUD DASHBOARD ERROR:", err);

    res.json({
      overview: {
        flaggedCalls: 0,
        blockedDevices: 0,
        riskyUsers: 0,
        trustDrops: 0,
      },
      timeline: [],
      users: [],
      heatmap: [],
    });
  }
});

/* ======================================================
   RAW FRAUD DATA
====================================================== */

/**
 * GET /api/admin/fraud
 * List flagged call sessions
 */
router.get("/", adminAuth, async (_req, res) => {
  const flagged = await CallSession.find({ flagged: true })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("userId", "email");

  res.json(flagged);
});

/* ======================================================
   TRUST CONTROL
====================================================== */

/**
 * POST /api/admin/fraud/trust/:userId
 */
router.post("/trust/:userId", adminAuth, async (req, res) => {
  const { delta, reason } = req.body;
  const { userId } = req.params;

  if (typeof delta !== "number") {
    return res.status(400).json({
      message: "delta must be a number",
    });
  }

  const trust =
    (await UserTrust.findOne({ userId })) ||
    (await UserTrust.create({ userId }));

  trust.score = Math.max(
    0,
    Math.min(100, trust.score + delta)
  );

  await trust.save();

  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "TRUST_ADJUSTED",
    meta: {
      userId,
      delta,
      newScore: trust.score,
      reason,
    },
  });

  res.json({
    success: true,
    userId,
    trustScore: trust.score,
  });
});

/* ======================================================
   LEGACY ENDPOINTS (OPTIONAL KEEP)
====================================================== */

router.get("/overview", adminAuth, async (_req, res) => {
  res.json(await getFraudOverview());
});

router.get("/timeline", adminAuth, async (_req, res) => {
  res.json(await getFraudTimeline());
});

router.get("/risky-users", adminAuth, async (_req, res) => {
  res.json(await getRiskyUsers());
});

router.get("/heatmap", adminAuth, async (_req, res) => {
  res.json(await getFraudHeatmap());
});

export default router;