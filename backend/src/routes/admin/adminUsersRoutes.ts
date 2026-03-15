import express from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminAuditLog from "../../models/AdminAuditLog";
import CallSession from "../../models/CallSession";
import User from "../../models/User";
import UserTrust from "../../models/UserTrust";
import Wallet from "../../models/Wallet";

const router = express.Router();

/**
 * ======================================================
 * GET /api/admin/users
 * List all users with wallet + trust info
 * ======================================================
 */

router.get("/", adminAuth, async (_req, res) => {
  try {

    const users = await User.aggregate([

      {
        $lookup: {
          from: "wallets",
          localField: "_id",
          foreignField: "userId",
          as: "wallet"
        }
      },

      {
        $lookup: {
          from: "usertrusts",
          localField: "_id",
          foreignField: "userId",
          as: "trust"
        }
      },

      {
        $addFields: {

          wallet: { $arrayElemAt: ["$wallet", 0] },

          trust: {
            $ifNull: [
              { $arrayElemAt: ["$trust", 0] },
              { score: 100 }
            ]
          }

        }
      },

      {
        $project: {

          email: 1,
          createdAt: 1,
          pausedUntil: 1,
          pauseReason: 1,

          kycStatus: {
            $ifNull: ["$kycStatus", "pending"]
          },

          trustScore: "$trust.score",

          trustStatus: {
            $switch: {
              branches: [
                { case: { $lt: ["$trust.score", 40] }, then: "blocked" },
                { case: { $lt: ["$trust.score", 60] }, then: "limited" },
                { case: { $lt: ["$trust.score", 80] }, then: "reduced" }
              ],
              default: "good"
            }
          },

          totalMinutes: {
            $ifNull: ["$wallet.totalMinutes", 0]
          },

          balanceATC: {
            $ifNull: ["$wallet.balanceATC", 0]
          }

        }
      },

      {
        $sort: { createdAt: -1 }
      }

    ]);

    res.json({
      users
    });

  } catch (err) {

    console.error("ADMIN USERS ERROR:", err);

    res.status(500).json({
      message: "Failed to load users"
    });

  }
});

/**
 * ======================================================
 * POST /api/admin/users/:id/pause
 * Pause a single user
 * ======================================================
 */
router.post("/:id/pause", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { duration, reason } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });

  let pausedUntil: Date | null = null;

  if (duration === "24h") {
    pausedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
  } else if (duration === "7d") {
    pausedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  } else if (duration === "permanent") {
    pausedUntil = new Date("2999-01-01");
  } else {
    return res.status(400).json({ message: "Invalid duration" });
  }

  user.pausedUntil = pausedUntil;
  user.pauseReason = reason;
  await user.save();

  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "USER_PAUSED",
    meta: {
      userId: id,
      duration,
      reason,
      pausedUntil,
    },
  });

  res.json({ success: true, pausedUntil });
});

/**
 * ======================================================
 * POST /api/admin/users/:id/unpause
 * ======================================================
 */
router.post("/:id/unpause", adminAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.pausedUntil = null;
  user.pauseReason = undefined;
  await user.save();

  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "USER_UNPAUSED",
    meta: { userId: user._id },
  });

  res.json({ success: true });
});

/**
 * ======================================================
 * GET /api/admin/users/:id/fraud-timeline
 * ======================================================
 */
router.get("/:id/fraud-timeline", adminAuth, async (req, res) => {
  const { id } = req.params;

  const flaggedCalls = await CallSession.find({
    userId: id,
    flagged: true,
  })
    .select("createdAt durationSeconds")
    .limit(20)
    .lean();

  const auditLogs = await AdminAuditLog.find({
    "meta.userId": id,
    action: { $in: ["TRUST_UPDATED", "USER_PAUSED", "USER_UNPAUSED"] },
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const timeline = [
    ...flaggedCalls.map((c) => ({
      type: "FLAGGED_CALL",
      message: `Flagged call (${c.durationSeconds}s)`,
      createdAt: c.createdAt,
      severity: "warning",
    })),
    ...auditLogs.map((l) => ({
      type: l.action,
      message:
        l.action === "TRUST_UPDATED"
          ? `Trust score set to ${l.meta?.score}`
          : l.action === "USER_PAUSED"
          ? `User paused (${l.meta?.duration})`
          : "User unpaused",
      createdAt: l.createdAt,
      severity:
        l.action === "USER_PAUSED" ? "critical" : "info",
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 30);

  res.json(timeline);
});

/**
 * ======================================================
 * POST /api/admin/users/bulk
 * Bulk pause / resume / trust update
 * ======================================================
 */
router.post("/bulk", adminAuth, async (req, res) => {
  const { userIds, action, value, duration, reason } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: "No users selected" });
  }

  const now = Date.now();

  await Promise.all(
    userIds.map(async (userId: string) => {
      const user = await User.findById(userId);
      if (!user) return;

      // 🔒 PAUSE
      if (action === "PAUSE") {
        let pausedUntil: Date | null = null;

        if (duration === "24h") pausedUntil = new Date(now + 86400000);
        if (duration === "7d") pausedUntil = new Date(now + 604800000);
        if (duration === "permanent") pausedUntil = new Date("2999-01-01");

        user.pausedUntil = pausedUntil;
        user.pauseReason = reason;
        await user.save();

        await AdminAuditLog.create({
          adminId: req.admin._id,
          action: "USER_PAUSED",
          meta: { userId, duration, reason },
        });
      }

      // ▶ RESUME
      if (action === "RESUME") {
        user.pausedUntil = null;
        user.pauseReason = undefined;
        await user.save();

        await AdminAuditLog.create({
          adminId: req.admin._id,
          action: "USER_UNPAUSED",
          meta: { userId },
        });
      }

      // 🎯 TRUST
      if (action === "SET_TRUST" && typeof value === "number") {
        const trust = await UserTrust.findOneAndUpdate(
          { userId },
          { score: Math.max(0, Math.min(100, value)) },
          { upsert: true, new: true }
        );

        await AdminAuditLog.create({
          adminId: req.admin._id,
          action: "TRUST_UPDATED",
          meta: { userId, score: trust.score, reason },
        });
      }
    })
  );

  res.json({ success: true });
});

export default router;