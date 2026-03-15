import express from "express";
import adminAuth from "../../middleware/adminAuth";
import Device from "../../models/Device";
import UserTrust from "../../models/UserTrust";
import { emitAdminEvent } from "../../sockets/socket";

const router = express.Router();

/* ============================================
   DEVICE SUMMARY
============================================ */

router.get("/summary", adminAuth, async (req, res) => {

  try {

    const total = await Device.countDocuments();

    const trusted = await Device.countDocuments({
      trusted: true
    });

    const flagged = await Device.countDocuments({
      flagged: true
    });

    const blocked = await Device.countDocuments({
      blocked: true
    });

    const active = await Device.countDocuments({
      lastSeenAt: {
        $gte: new Date(
          Date.now() - 24 * 60 * 60 * 1000
        )
      }
    });

    res.json({
      total,
      trusted,
      flagged,
      blocked,
      active
    });

  } catch (err) {

    console.error("DEVICE SUMMARY ERROR:", err);

    res.status(500).json({
      message: "Failed to load summary"
    });

  }

});

/* ============================================
   GET DEVICES (OPTIMIZED)
============================================ */

router.get("/", adminAuth, async (req: any, res) => {

  try {

    const page = Number(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status || "";

    const match: any = {};

    if (search) {

      match.model = {
        $regex: search,
        $options: "i"
      };

    }

    if (status === "blocked") match.blocked = true;
    if (status === "flagged") match.flagged = true;
    if (status === "trusted") match.trusted = true;

    const devices = await Device.aggregate([

      { $match: match },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },

      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] }
        }
      },

      {
        $project: {

          deviceName: 1,
          brand: 1,
          model: 1,
          os: 1,
          osVersion: 1,

          trusted: 1,
          flagged: 1,
          blocked: 1,

          firstSeenAt: 1,
          lastSeenAt: 1,

          userEmail: "$user.email"

        }
      },

      { $sort: { lastSeenAt: -1 } },

      { $skip: skip },

      { $limit: limit }

    ]);

    const total = await Device.countDocuments(match);

    res.json({

      devices,

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

  await Device.findByIdAndUpdate(
    req.params.id,
    {
      trusted: true,
      flagged: false,
      blocked: false
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

  await Device.findByIdAndUpdate(
    req.params.id,
    {
      flagged: true,
      trusted: false
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

  await Device.findByIdAndUpdate(
    req.params.id,
    {
      blocked: true,
      flagged: true,
      trusted: false
    }
  );

  emitAdminEvent("device.blocked", {
    deviceId: req.params.id
  });

  res.json({ success: true });

});

/* ============================================
   RESET USER TRUST
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