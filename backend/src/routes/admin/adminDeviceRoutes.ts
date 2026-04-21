import express from "express";
import mongoose from "mongoose";
import adminAuth from "../../middleware/adminAuth";
import UserDevice from "../../models/UserDevice";
import UserTrust from "../../models/UserTrust";
import { emitAdminEvent } from "../../sockets/socket";

const router = express.Router();

/* ============================================
   DEVICE SUMMARY
============================================ */
router.get("/summary", adminAuth, async (_req, res) => {
  try {
    const now = Date.now();

    const [total, trusted, flagged, blocked, active] = await Promise.all([
      UserDevice.countDocuments(),
      UserDevice.countDocuments({ trusted: true }),
      UserDevice.countDocuments({ flagged: true }),
      UserDevice.countDocuments({ blocked: true }),
      UserDevice.countDocuments({
        lastSeenAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({ total, trusted, flagged, blocked, active });

  } catch (err) {
    console.error("❌ DEVICE SUMMARY ERROR:", err);
    res.status(500).json({ message: "Failed to load summary" });
  }
});

/* ============================================
   GET DEVICES (PAGINATED)
============================================ */
router.get("/", adminAuth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const [devices, total] = await Promise.all([
      UserDevice.find()
        .populate("userId", "email")
        .sort({ lastSeenAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      UserDevice.countDocuments(),
    ]);

    res.json({
      devices,
      pagination: {
        page,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("❌ GET DEVICES ERROR:", err);
    res.status(500).json({ message: "Failed to load devices" });
  }
});

/* ============================================
   TRUST DEVICE
============================================ */
router.post("/:id/trust", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const device = await UserDevice.findByIdAndUpdate(
      id,
      {
        trusted: true,
        flagged: false,
        blocked: false,
        riskScore: 0,
        verifiedAt: new Date(),
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    emitAdminEvent("DEVICE_TRUSTED", { deviceId: id });

    res.json({ success: true });

  } catch (err) {
    console.error("❌ TRUST DEVICE ERROR:", err);
    res.status(500).json({ message: "Failed to trust device" });
  }
});

/* ============================================
   FLAG DEVICE
============================================ */
router.post("/:id/flag", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const device = await UserDevice.findByIdAndUpdate(
      id,
      {
        flagged: true,
        trusted: false,
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    emitAdminEvent("DEVICE_FLAGGED", { deviceId: id });

    res.json({ success: true });

  } catch (err) {
    console.error("❌ FLAG DEVICE ERROR:", err);
    res.status(500).json({ message: "Failed to flag device" });
  }
});

/* ============================================
   BLOCK DEVICE
============================================ */
router.post("/:id/block", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid device ID" });
    }

    const device = await UserDevice.findByIdAndUpdate(
      id,
      {
        blocked: true,
        flagged: true,
        trusted: false,
        riskScore: 100,
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    emitAdminEvent("DEVICE_BLOCKED", { deviceId: id });

    res.json({ success: true });

  } catch (err) {
    console.error("❌ BLOCK DEVICE ERROR:", err);
    res.status(500).json({ message: "Failed to block device" });
  }
});

/* ============================================
   RESET USER TRUST
============================================ */
router.post("/users/:userId/trust/reset", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    await UserTrust.findOneAndUpdate(
      { userId },
      { score: 100 },
      { upsert: true }
    );

    emitAdminEvent("USER_TRUST_RESET", { userId });

    res.json({ success: true });

  } catch (err) {
    console.error("❌ RESET TRUST ERROR:", err);
    res.status(500).json({ message: "Failed to reset trust" });
  }
});

export default router;