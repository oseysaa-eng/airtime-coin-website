import express from "express";
import adminAuth from "../../middleware/adminAuth";
import UserDevice from "../../models/UserDevice";
import UserTrust from "../../models/UserTrust";

const router = express.Router();

/* SUMMARY */
router.get("/summary", adminAuth, async (req, res) => {
  try {

    const total = await UserDevice.countDocuments();
    const trusted = await UserDevice.countDocuments({ trusted: true });
    const flagged = await UserDevice.countDocuments({ flagged: true });
    const blocked = await UserDevice.countDocuments({ blocked: true });

    const active = await UserDevice.countDocuments({
      lastSeen: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
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
      message: "Failed to load device summary",
    });

  }
});

/* GET ALL DEVICES */
router.get("/", adminAuth, async (req, res) => {

  const devices = await UserDevice.find()
    .populate("userId", "email")
    .lean();

  res.json({ devices });

});

/* TRUST */
router.post("/:id/trust", adminAuth, async (req, res) => {

  await UserDevice.findByIdAndUpdate(req.params.id, {
    trusted: true,
    flagged: false,
    blocked: false,
    riskScore: 0,
  });

  res.json({ success: true });

});

/* FLAG */
router.post("/:id/flag", adminAuth, async (req, res) => {

  await UserDevice.findByIdAndUpdate(req.params.id, {
    flagged: true,
    trusted: false,
  });

  res.json({ success: true });

});

/* BLOCK */
router.post("/:id/block", adminAuth, async (req, res) => {

  await UserDevice.findByIdAndUpdate(req.params.id, {
    blocked: true,
    flagged: true,
    trusted: false,
    riskScore: 100,
  });

  res.json({ success: true });

});



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