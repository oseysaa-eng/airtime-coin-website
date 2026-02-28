import express from "express";
import adminAuth from "../../middleware/adminAuth";
import InviteCode from "../../models/InviteCode";
import crypto from "crypto";

const router = express.Router();

/**
 * GET all invite codes
 */
router.get("/", adminAuth, async (_req, res) => {

  const codes = await InviteCode.find()
    .populate("usedBy", "email name")
    .sort({ createdAt: -1 });

  res.json({ codes });

});

/**
 * CREATE invite code
 */
router.post("/", adminAuth, async (req, res) => {

  const { code, maxUses } = req.body;

  if (!code)
    return res.status(400).json({
      message: "Code required"
    });

  const exists = await InviteCode.findOne({ code });

  if (exists)
    return res.status(409).json({
      message: "Code already exists"
    });

  const invite = await InviteCode.create({

    code,

    maxUses: maxUses || 1,

    active: true,

    usedCount: 0,

  });

  res.json({
    message: "Invite code created",
    invite
  });

});


/**
 * BULK GENERATE INVITES
 */
router.post("/generate-bulk", adminAuth, async (req, res) => {

  const count = Number(req.body.count) || 30;

  if (count > 1000)
    return res.status(400).json({
      message: "Max 1000 per batch"
    });

  const invites = [];

  for (let i = 0; i < count; i++) {

    const code =
      "ATC-" +
      crypto.randomBytes(4)
      .toString("hex")
      .toUpperCase();

    invites.push({
      code,
      active: true,
      usedCount: 0,
      maxUses: 1
    });

  }

  const created = await InviteCode.insertMany(invites);

  res.json({
    message: `${count} invite codes created`,
    codes: created
  });

});


/**
 * DISABLE invite code
 */
router.post("/:id/disable", adminAuth, async (req, res) => {

  await InviteCode.findByIdAndUpdate(
    req.params.id,
    { active: false }
  );

  res.json({ success: true });

});

export default router;