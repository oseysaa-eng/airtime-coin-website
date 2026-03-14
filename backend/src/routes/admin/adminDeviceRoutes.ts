import express from "express";
import adminAuth from "../../middleware/adminAuth";
import UserDevice from "../../models/UserDevice";
import UserTrust from "../../models/UserTrust";
import { emitAdminEvent } from "../../sockets/socket";
import Device from "../../models/Device";
import User from "../../models/User";

const router = express.Router();

/* ============================================
   DEVICE SUMMARY
============================================ */

router.get("/summary", adminAuth, async (req, res) => {

  try {

    const total = await UserDevice.countDocuments();

    const trusted = await UserDevice.countDocuments({
      trusted: true
    });

    const flagged = await UserDevice.countDocuments({
      flagged: true
    });

    const blocked = await UserDevice.countDocuments({
      blocked: true
    });

    const active = await UserDevice.countDocuments({
      lastSeen: {
        $gte: new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ),
      },
    });

    res.json({
      total,
      trusted,
      flagged,
      blocked,
      active,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to load summary"
    });

  }

});

/* ============================================
   GET DEVICES
============================================ */

router.get("/", adminAuth, async (req: any, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status || "";

    const query: any = {};

    /* SEARCH */

    if (search) {
      query.model = { $regex: search, $options: "i" };
    }

    /* STATUS FILTER */

    if (status === "blocked") query.blocked = true;
    if (status === "flagged") query.flagged = true;
    if (status === "trusted") query.trusted = true;

    const devices = await Device.find(query)
      .sort({ lastSeenAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    /* ATTACH USER INFO */

    const enriched = await Promise.all(
      devices.map(async (d) => {

        const user = await User.findById(d.userId)
          .select("email");

        return {
          ...d,
          userEmail: user?.email || "unknown"
        };

      })
    );

    const total = await Device.countDocuments(query);

    res.json({

      devices: enriched,

      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total
      }

    });

  } catch (err) {

    console.error("ADMIN DEVICE LIST ERROR:", err);

    res.status(500).json({
      message: "Failed to load devices"
    });

  }
});

/* ============================================
   TRUST DEVICE
============================================ */

router.post("/:id/trust", adminAuth, async (req, res) => {

  await UserDevice.findByIdAndUpdate(
    req.params.id,
    {
      trusted: true,
      flagged: false,
      blocked: false,
      riskScore: 0,
    }
  );

  emitAdminEvent("device.trusted", {
    deviceId: req.params.id
  });

  res.json({ success: true });

});

/* ============================================
   FLAG DEVICE
============================================ */

router.post("/:id/flag", adminAuth, async (req, res) => {

  await UserDevice.findByIdAndUpdate(
    req.params.id,
    {
      flagged: true,
      trusted: false,
    }
  );

  emitAdminEvent("device.flagged", {
    deviceId: req.params.id
  });

  res.json({ success: true });

});

/* ============================================
   BLOCK DEVICE
============================================ */

router.post("/:id/block", adminAuth, async (req, res) => {

  await UserDevice.findByIdAndUpdate(
    req.params.id,
    {
      blocked: true,
      flagged: true,
      trusted: false,
      riskScore: 100,
    }
  );

  emitAdminEvent("device.blocked", {
    deviceId: req.params.id
  });

  res.json({ success: true });

});

/* ============================================
   RESET TRUST
============================================ */

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