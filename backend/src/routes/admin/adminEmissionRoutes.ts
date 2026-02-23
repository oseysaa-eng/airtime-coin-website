// src/routes/admin/adminEmissionRoutes.ts
import express from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminAuditLog from "../../models/AdminAuditLog";
import EmissionState from "../../models/EmissionState";
import { triggerHalving } from "../../services/emissionService";

const router = express.Router();

/**
 * GET /admin/emission
 */
router.get("/", adminAuth, async (_req, res) => {
  const state =
    (await EmissionState.findOne()) ||
    (await EmissionState.create({}));

  res.json(state);
});

/**
 * POST /admin/emission/halve
 */
router.post("/halve", adminAuth, async (req, res) => {
  const updated = await triggerHalving();

  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "EMISSION_HALVED",
    meta: {
      phase: updated.phase,
      multiplier: updated.multiplier,
    },
  });

  res.json(updated);
});

export default router;
