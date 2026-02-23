import express from "express";
import EmissionState from "../models/EmissionState";

const router = express.Router();

/**
 * GET /api/emission
 * Public, read-only
 */
router.get("/", async (_req, res) => {
  const emission = await EmissionState.findOne();

  res.json({
    phase: emission?.phase ?? 0,
    multiplier: emission?.multiplier ?? 1,
    lastHalvingAt: emission?.lastHalvingAt,
  });
});

export default router;
