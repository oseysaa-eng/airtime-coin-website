import express from "express";
import auth from "../middleware/authMiddleware";
import UserDevice from "../models/UserDevice";
import { bindDevice } from "../services/deviceTrustService";

const router = express.Router();

/**
 * POST /api/device/bind
 * Trust a newly detected device
 */
router.post("/bind", auth, async (req: any, res) => {
  try {
    const { fingerprint } = req.body;

    if (!fingerprint) {
      return res.status(400).json({
        message: "Device fingerprint is required",
      });
    }

    const device = await bindDevice({
      userId: req.user.id,
      fingerprint,
      deviceName: req.headers["user-agent"] as string,
      platform: req.headers["x-platform"] as string,
      ip: req.ip,
    });

    res.json({
      success: true,
      trusted: device.trusted,
      trustScore: device.trustScore,
      flagged: device.flagged,
      message: "Device successfully trusted",
    });
  } catch (err: any) {
    console.error("DEVICE BIND ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to bind device",
    });
  }
});


/**
 * GET /api/devices
 * List user's devices
 */
router.get("/", auth, async (req: any, res) => {
  const devices = await UserDevice.find({
    userId: req.user.id,
  }).sort({ lastSeen: -1 });

  res.json({ devices });
});

/**
 * DELETE /api/devices/:id
 * Remove device (force logout)
 */
router.delete("/:id", auth, async (req: any, res) => {
  const device = await UserDevice.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!device) {
    return res.status(404).json({
      message: "Device not found",
    });
  }

  await device.deleteOne();

  res.json({ success: true });
});

export default router;