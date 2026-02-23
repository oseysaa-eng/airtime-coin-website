import express from "express";
import adminAuth from "../../middleware/adminAuth";
import UserDevice from "../../models/UserDevice";
import UserTrust from "../../models/UserTrust";

const router = express.Router();

/* ======================================================
   GET ALL DEVICES (ADMIN DASHBOARD)
====================================================== */

router.get("/devices", adminAuth, async (_req, res) => {
  const devices = await UserDevice.find()
    .populate("userId", "email name")
    .sort({ lastSeen: -1 });

  res.json({ devices });
});

/* ======================================================
   GET USER DEVICES
====================================================== */

router.get(
  "/users/:userId/devices",
  adminAuth,
  async (req, res) => {
    const devices = await UserDevice.find({
      userId: req.params.userId,
    }).sort({ lastSeen: -1 });

    res.json({ devices });
  }
);

/* ======================================================
   DEVICE ACTIONS
====================================================== */

router.post(
  "/devices/:id/trust",
  adminAuth,
  async (req, res) => {
    const device = await UserDevice.findById(req.params.id);

    if (!device)
      return res.status(404).json({ message: "Device not found" });

    device.trusted = true;
    device.flagged = false;
    device.blocked = false;
    device.riskScore = 0;

    await device.save();

    res.json({ success: true });
  }
);

router.post(
  "/devices/:id/flag",
  adminAuth,
  async (req, res) => {
    const device = await UserDevice.findById(req.params.id);

    if (!device)
      return res.status(404).json({ message: "Device not found" });

    device.flagged = true;
    device.trusted = false;
    device.blocked = false;
    device.riskScore = Math.min(100, device.riskScore + 25);

    await device.save();

    res.json({ success: true });
  }
);

router.post(
  "/devices/:id/block",
  adminAuth,
  async (req, res) => {
    const device = await UserDevice.findById(req.params.id);

    if (!device)
      return res.status(404).json({ message: "Device not found" });

    device.blocked = true;
    device.flagged = true;
    device.trusted = false;
    device.riskScore = 100;

    await device.save();

    res.json({ success: true });
  }
);

/* ======================================================
   RESET USER TRUST
====================================================== */

router.post(
  "/users/:userId/trust/reset",
  adminAuth,
  async (req, res) => {
    await UserTrust.findOneAndUpdate(
      { userId: req.params.userId },
      { score: 100 },
      { upsert: true }
    );

    res.json({ success: true });
  }
);

export default router;