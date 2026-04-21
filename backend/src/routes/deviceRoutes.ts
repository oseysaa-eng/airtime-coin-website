import express from "express";
import mongoose from "mongoose";
import auth from "../middleware/authMiddleware";
import UserDevice from "../models/UserDevice";
import { bindDevice } from "../services/deviceTrustService";

const router = express.Router();

/**
 * POST /api/device/bind
 */
router.post("/bind", auth, async (req: any, res) => {
  try {
    const { fingerprint } = req.body;

    /* ================= VALIDATION ================= */
    if (!fingerprint || fingerprint.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid device fingerprint",
      });
    }

    /* ================= CHECK EXISTING ================= */
    const existing = await UserDevice.findOne({
      userId: req.user.id,
      fingerprint,
    });

    if (existing) {
      return res.json({
        success: true,
        trusted: existing.trusted,
        flagged: existing.flagged,
        message: "Device already registered",
      });
    }

    /* ================= LIMIT ================= */
    const MAX_DEVICES = 5;

    const count = await UserDevice.countDocuments({
      userId: req.user.id,
    });

    if (count >= MAX_DEVICES) {
      return res.status(403).json({
        success: false,
        message: "Device limit reached",
      });
    }

    /* ================= BIND ================= */
    const device = await bindDevice({
      userId: req.user.id,
      fingerprint,
      deviceName: req.headers["user-agent"] || "Unknown Device",
      platform: req.headers["x-platform"] || "unknown",
      ip: req.ip,
    });

    console.log("📱 Device bound:", {
      userId: req.user.id,
      fingerprint,
      ip: req.ip,
    });

    res.json({
      success: true,
      trusted: device.trusted,
      trustScore: device.trustScore,
      flagged: device.flagged,
      message: "Device successfully trusted",
    });

  } catch (err) {
    console.error("DEVICE BIND ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to bind device",
    });
  }
});

/**
 * GET /api/devices
 */
router.get("/", auth, async (req: any, res) => {
  try {
    const devices = await UserDevice.find({
      userId: req.user.id,
    }).sort({ lastSeen: -1 });

    res.json({
      success: true,
      devices,
    });
  } catch (err) {
    console.error("GET DEVICES ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load devices",
    });
  }
});

/**
 * DELETE /api/devices/:id
 */
router.delete("/:id", auth, async (req: any, res) => {
  try {
    const { id } = req.params;

    /* ================= VALIDATE ID ================= */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device ID",
      });
    }

    const device = await UserDevice.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found",
      });
    }

    /* ================= OPTIONAL PROTECTION ================= */
    if (device.isCurrent) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove current device",
      });
    }

    await device.deleteOne();

    console.log("🗑️ Device removed:", {
      userId: req.user.id,
      deviceId: id,
    });

    res.json({
      success: true,
      message: "Device removed",
    });

  } catch (err) {
    console.error("DELETE DEVICE ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to delete device",
    });
  }
});

export default router;