import express from "express";
import adminAuth from "../../middleware/adminAuth";

import AdminAuditLog from "../../models/AdminAuditLog";
import ConversionPool from "../../models/ConversionPool";
import RewardPool from "../../models/RewardPool";
import SystemSettings from "../../models/SystemSettings";
import Transaction from "../../models/Transaction";
import UserTrust from "../../models/UserTrust";

const router = express.Router();

/* =====================================================
   🧠 ADMIN SYSTEM OVERVIEW
   GET /api/admin/system
===================================================== */
router.get("/", adminAuth, async (_req, res) => {
  const settings =
    (await SystemSettings.findOne()) ||
    (await SystemSettings.create({}));

  const rewardPools = await RewardPool.find();

  const conversionPool =
    (await ConversionPool.findOne()) ||
    (await ConversionPool.create({}));

  /* 🔥 Burn rate (last 30 days) */
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const burnAgg = await Transaction.aggregate([

{
  $group: {
    _id: {
      source: "$source",
      day: { $dayOfYear: "$createdAt" },
    },
    dailyTotal: { $sum: "$amount" },
  },
},
{
  $group: {
    _id: "$_id.source",
    avgDaily: { $avg: "$dailyTotal" },
    total: { $sum: "$dailyTotal" },
  },
},
  ]);

  const burn = burnAgg.map(b => {
    const pool = rewardPools.find(p => p.type === b._id);
    const balanceATC = pool?.balanceATC ?? 0;

    return {
      source: b._id,
      avgDailyATC: Number((b.avgDaily || 0).toFixed(4)),
      totalATC: Number((b.total || 0).toFixed(4)),
      balanceATC,
      daysLeft:
        b.avgDaily > 0
          ? Math.floor(balanceATC / b.avgDaily)
          : null,
    };
  });

  /* 🚨 Trust insight */
  const lowTrustUsers = await UserTrust.countDocuments({
    score: { $lt: 40 },
  });

  /* ⚠️ Warnings engine */
  const warnings: any[] = [];

  if (settings.incidentMode?.active) {
    warnings.push({
      id: "incident_mode",
      level: "critical",
      title: "Incident Mode Active",
      message: settings.incidentMode.message || "System is paused",
    });
  }

  rewardPools.forEach(pool => {
    if (!pool.paused && pool.balanceATC < pool.dailyLimitATC * 3) {
      warnings.push({
        id: `low_pool_${pool.type}`,
        level: "warning",
        title: `${pool.type} Pool Low`,
        message: `${pool.type} reward pool is running low.`,
      });
    }
  });

  if (conversionPool.paused) {
    warnings.push({
      id: "conversion_paused",
      level: "warning",
      title: "Conversion Paused",
      message: "Minutes → ATC conversion is currently paused.",
    });
  }

  if (lowTrustUsers > 10) {
    warnings.push({
      id: "low_trust_users",
      level: "info",
      title: "Low Trust Users",
      message: `${lowTrustUsers} users are currently restricted.`,
    });
  }

  res.json({
    settings,
    pools: rewardPools,
    conversion: conversionPool,
    burn,
    warnings,
  });
});

/* =====================================================
   🚨 EMERGENCY KILL SWITCH
   POST /api/admin/system/emergency
===================================================== */
router.post("/emergency", adminAuth, async (req, res) => {
  try {
    const { active, message } = req.body;

    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    settings.incidentMode = {
      active: Boolean(active),
      message: message || "",
      activatedAt: active ? new Date() : null,
      activatedBy: active ? req.admin._id : null,
    };

    /* 🔥 HARD SYSTEM LOCK */
    if (active) {
      settings.beta.showWithdrawals = false;
      settings.beta.showConversion = false;

      await RewardPool.updateMany({}, { paused: true });
      await ConversionPool.updateOne({}, { paused: true });
    }

    await settings.save();

    await AdminAuditLog.create({
      adminId: req.admin._id,
      action: active
        ? "INCIDENT_MODE_ON"
        : "INCIDENT_MODE_OFF",
      meta: { message },
    });

    res.json({
      success: true,
      incidentMode: settings.incidentMode,
    });

  } catch (err) {
    console.error("EMERGENCY ERROR:", err);
    res.status(500).json({ message: "Failed to toggle emergency mode" });
  }
});

/* =====================================================
   ⚙️ SYSTEM TOGGLES (HARD KILLS)
   POST /api/admin/system/toggles
===================================================== */
router.post("/toggles", adminAuth, async (req, res) => {
  try {
    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    const allowedFields = [
      "rewardsPaused",
      "conversionPaused",
      "withdrawalsPaused",
    ];

    for (const key of allowedFields) {
      if (typeof req.body[key] === "boolean") {
        (settings as any)[key] = req.body[key];
      }
    }

    await settings.save();

    await AdminAuditLog.create({
      adminId: req.admin._id,
      action: "SYSTEM_TOGGLES_UPDATED",
      meta: req.body,
    });

    res.json({ success: true, settings });
  } catch (err) {
    console.error("TOGGLES ERROR:", err);
    res.status(500).json({ message: "Failed to update toggles" });
  }
});

/* =====================================================
   💰 UTILITY FEES
   POST /api/admin/system/utility-fees
===================================================== */
router.post("/utility-fees", adminAuth, async (req, res) => {
  const { burnPercent, treasuryPercent } = req.body;

  if (
    typeof burnPercent !== "number" ||
    typeof treasuryPercent !== "number" ||
    burnPercent + treasuryPercent > 100
  ) {
    return res.status(400).json({
      message: "Invalid fee configuration",
    });
  }

  const settings =
    (await SystemSettings.findOne()) ||
    (await SystemSettings.create({}));

  settings.utilityFees = { burnPercent, treasuryPercent };
  await settings.save();

  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "UTILITY_FEES_UPDATED",
    meta: settings.utilityFees,
  });

  res.json({
    success: true,
    utilityFees: settings.utilityFees,
  });
});

/* =====================================================
   🧪 BETA CONTROLS
   POST /api/admin/system/beta
===================================================== */
router.post("/beta", adminAuth, async (req, res) => {
  try {
    const {
      active,
      maxUsers,
      showConversion,
      showWithdrawals,
    } = req.body;

    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    /* ✅ SAFE UPDATE */
    if (typeof active === "boolean") settings.beta.active = active;

    if (typeof maxUsers === "number" && maxUsers >= 0) {
      settings.beta.maxUsers = maxUsers;
    }

    if (typeof showConversion === "boolean") {
      settings.beta.showConversion = showConversion;
    }

    if (typeof showWithdrawals === "boolean") {
      settings.beta.showWithdrawals = showWithdrawals;
    }

    await settings.save();

    await AdminAuditLog.create({
      adminId: req.admin._id,
      action: "BETA_SETTINGS_UPDATED",
      meta: settings.beta,
    });

    res.json({
      success: true,
      beta: settings.beta,
    });

  } catch (err) {
    console.error("BETA UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update beta settings" });
  }
});

export default router;