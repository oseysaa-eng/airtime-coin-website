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
const safe = (result: any, fallback: any, label: string) => {
  if (result.status === "fulfilled") return result.value;

  console.error(`❌ FRAUD ${label} ERROR:`, result.reason);
  return fallback;
};

router.get("/dashboard", adminAuth, async (_req, res) => {
  try {
    const results = await Promise.allSettled([
      getFraudOverview(),
      getFraudTimeline(),
      getRiskyUsers(),
      getFraudHeatmap(),
    ]);

    res.json({
      overview: safe(results[0], {
        flaggedCalls: 0,
        blockedDevices: 0,
        riskyUsers: 0,
        trustDrops: 0,
      }, "overview"),

      timeline: safe(results[1], [], "timeline"),
      users: safe(results[2], [], "users"),
      heatmap: safe(results[3], [], "heatmap"),
    });

  } catch (err) {
    console.error("FRAUD DASHBOARD ERROR:", err);

    res.status(500).json({
      message: "Failed to load fraud dashboard",
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
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 50), 100);

    const flagged = await CallSession.find({ flagged: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "email");

    res.json({
      page,
      limit,
      data: flagged,
    });

  } catch (err) {
    console.error("FLAGGED FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to fetch flagged calls" });
  }
});

/* ======================================================
   TRUST CONTROL
====================================================== */

/**
 * POST /api/admin/fraud/trust/:userId
 */
router.post("/trust/:userId", adminAuth, async (req: any, res) => {
  try {
    const { delta, reason } = req.body;
    const { userId } = req.params;

    /* ✅ VALIDATION */
    if (typeof delta !== "number" || Math.abs(delta) > 50) {
      return res.status(400).json({
        message: "delta must be a number between -50 and 50",
      });
    }

    const trust = await UserTrust.findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          score: 100,
        },
      },
      { new: true, upsert: true }
    );

    /* 🔒 CLAMP */
    trust.score = Math.max(0, Math.min(100, trust.score + delta));

    await trust.save();

    /* 🧾 AUDIT */
    await AdminAuditLog.create({
      adminId: req.admin._id,
      action: "TRUST_ADJUSTED",
      meta: {
        userId,
        delta,
        newScore: trust.score,
        reason: reason || "manual_adjustment",
      },
    });

    res.json({
      success: true,
      userId,
      trustScore: trust.score,
    });

  } catch (err) {
    console.error("TRUST UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update trust" });
  }
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