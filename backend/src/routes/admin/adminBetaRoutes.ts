import express, { Request, Response } from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminAuditLog from "../../models/AdminAuditLog";
import InviteCode from "../../models/InviteCode";
import SystemSettings from "../../models/SystemSettings";

const router = express.Router();

/* =====================================================
   🧪 GET BETA SETTINGS
   GET /api/admin/beta
===================================================== */
router.get("/", adminAuth, async (_req: Request, res: Response) => {
  try {
    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    res.json({
      success: true,
      beta: settings.beta,
      incidentMode: settings.incidentMode,
    });
  } catch (err) {
    console.error("BETA FETCH ERROR:", err);
    res.status(500).json({ message: "Failed to load beta settings" });
  }
});

/* =====================================================
   🧪 UPDATE BETA SETTINGS
   POST /api/admin/beta
===================================================== */
router.post("/", adminAuth, async (req: any, res: Response) => {
  try {
    const {
      active,
      maxUsers,
      showConversion,
      showWithdrawals,
      showAds,
      dailyAdLimit,
      dailyMinutesCap,
    } = req.body;

    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    /* 🛡 VALIDATION */
    if (
      (maxUsers !== undefined && maxUsers < 1) ||
      (dailyAdLimit !== undefined && dailyAdLimit < 0) ||
      (dailyMinutesCap !== undefined && dailyMinutesCap < 0)
    ) {
      return res.status(400).json({
        message: "Invalid beta configuration values",
      });
    }

    /* ✅ SAFE UPDATE */
    if (typeof active === "boolean") settings.beta.active = active;
    if (typeof maxUsers === "number") settings.beta.maxUsers = maxUsers;
    if (typeof showConversion === "boolean")
      settings.beta.showConversion = showConversion;
    if (typeof showWithdrawals === "boolean")
      settings.beta.showWithdrawals = showWithdrawals;
    if (typeof showAds === "boolean")
      settings.beta.showAds = showAds;
    if (typeof dailyAdLimit === "number")
      settings.beta.dailyAdLimit = dailyAdLimit;
    if (typeof dailyMinutesCap === "number")
      settings.beta.dailyMinutesCap = dailyMinutesCap;

    /* 🔒 Safety rule */
    if (!settings.beta.active) {
      settings.beta.showConversion = false;
      settings.beta.showWithdrawals = false;
      settings.beta.showAds = false;
    }

    await settings.save();

    /* 🧾 Audit */
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

/* =====================================================
   🚨 EMERGENCY MODE
   POST /api/admin/beta/emergency
===================================================== */
router.post("/emergency", adminAuth, async (req: any, res: Response) => {
  try {
    const { active, message } = req.body;

    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    settings.incidentMode.active = Boolean(active);
    settings.incidentMode.message = message || "";
    settings.incidentMode.activatedAt = active ? new Date() : null;
    settings.incidentMode.activatedBy = active ? req.admin._id : null;

    /* 🔥 Hard safety */
    if (active) {
      settings.beta.showConversion = false;
      settings.beta.showWithdrawals = false;
      settings.beta.showAds = false;
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
   🎟 GENERATE INVITE CODES
   POST /api/admin/beta/invites/generate
===================================================== */
router.post("/invites/generate", adminAuth, async (req: any, res: Response) => {
  try {
    let { count } = req.body;
    count = Number(count);

    if (!count || count <= 0) {
      return res.status(400).json({
        message: "Invalid count value",
      });
    }

    if (count > 100) {
      return res.status(400).json({
        message: "Maximum 100 codes per request",
      });
    }

    const codes = [];

    for (let i = 0; i < count; i++) {
      let code: string;
      let exists = true;

      while (exists) {
        code = `ATC-${Math.random()
          .toString(36)
          .substring(2, 8)
          .toUpperCase()}`;

        exists = await InviteCode.exists({ code });
      }

      const newCode = await InviteCode.create({
        code,
        createdBy: req.admin._id,
      });

      codes.push(newCode);
    }

    res.json({
      success: true,
      count: codes.length,
      codes,
    });
  } catch (err) {
    console.error("INVITE GENERATION ERROR:", err);
    res.status(500).json({
      message: "Failed to generate invite codes",
    });
  }
});

/* =====================================================
   📋 LIST INVITE CODES
   GET /api/admin/beta/invites
===================================================== */
router.get("/invites", adminAuth, async (_req: Request, res: Response) => {
  try {
    const codes = await InviteCode.find()
      .populate("usedBy", "email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: codes.length,
      codes,
    });
  } catch (err) {
    console.error("INVITE LIST ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch invite codes",
    });
  }
});

export default router;