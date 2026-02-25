import express from "express";
import mongoose from "mongoose";
import adminAuth from "../../middleware/adminAuth";
import UserDevice from "../../models/UserDevice";
import UserTrust from "../../models/UserTrust";

const router = express.Router();

/* ======================================================
   GET ALL DEVICES
   GET /api/admin/devices
====================================================== */
router.get("/", adminAuth, async (_req, res) => {
  try {
    const devices = await UserDevice.find()
      .populate("userId", "email name")
      .sort({ lastSeen: -1 })
      .lean();

    res.json({ devices });
  } catch (err) {
    console.error("ADMIN ALL DEVICES ERROR", err);
    res.status(500).json({ message: "Failed to fetch devices" });
  }
});

/* ======================================================
   GET USER DEVICES
   GET /api/admin/devices/user/:userId
====================================================== */
router.get("/user/:userId", adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const devices = await UserDevice.find({ userId })
      .sort({ lastSeen: -1 })
      .lean();

    res.json({
      count: devices.length,
      devices,
    });
  } catch (err) {
    console.error("ADMIN USER DEVICES ERROR", err);
    res.status(500).json({
      message: "Failed to load user devices",
    });
  }
});

/* ======================================================
   DEVICE ACTIONS
====================================================== */

router.post("/:id/trust", adminAuth, async (req, res) => {
  try {
    const device = await UserDevice.findById(req.params.id);
    if (!device)
      return res.status(404).json({ message: "Device not found" });

    device.trusted = true;
    device.flagged = false;
    device.blocked = false;
    device.riskScore = 0;

    await device.save();
    res.json({ success: true });
  } catch (err) {
    console.error("TRUST DEVICE ERROR", err);
    res.status(500).json({ message: "Trust failed" });
  }
});

router.post("/:id/flag", adminAuth, async (req, res) => {
  try {
    const device = await UserDevice.findById(req.params.id);
    if (!device)
      return res.status(404).json({ message: "Device not found" });

    device.flagged = true;
    device.trusted = false;
    device.blocked = false;
    device.riskScore = Math.min(100, device.riskScore + 25);

    await device.save();
    res.json({ success: true });
  } catch (err) {
    console.error("FLAG DEVICE ERROR", err);
    res.status(500).json({ message: "Flag failed" });
  }
});

router.post("/:id/block", adminAuth, async (req, res) => {
  try {
    const device = await UserDevice.findById(req.params.id);
    if (!device)
      return res.status(404).json({ message: "Device not found" });

    device.blocked = true;
    device.flagged = true;
    device.trusted = false;
    device.riskScore = 100;

    await device.save();
    res.json({ success: true });
  } catch (err) {
    console.error("BLOCK DEVICE ERROR", err);
    res.status(500).json({ message: "Block failed" });
  }
});

export default router;