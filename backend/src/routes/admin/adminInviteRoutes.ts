import express from "express";
import crypto from "crypto";

import adminAuth from "../../middleware/adminAuth";
import InviteCode from "../../models/InviteCode";

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
 * CREATE single invite code
 */
router.post("/", adminAuth, async (req, res) => {

  const { code } = req.body;

  if (!code)
    return res.status(400).json({
      message: "Code required",
    });

  const exists = await InviteCode.findOne({ code });

  if (exists)
    return res.status(409).json({
      message: "Code already exists",
    });

  const invite = await InviteCode.create({

    code: code.toUpperCase(),

    active: true,

    createdBy: req.user.id,

  });

  res.json({
    message: "Invite created",
    invite,
  });

});


/**
 * BULK GENERATE invite codes
 */
router.post("/generate", adminAuth, async (req, res) => {

  const count = Number(req.body.count) || 10;

  if (count > 500)
    return res.status(400).json({
      message: "Max 500 per request",
    });

  const invites = [];

  for (let i = 0; i < count; i++) {

    invites.push({

      code:
        "ATC-" +
        crypto.randomBytes(4)
          .toString("hex")
          .toUpperCase(),

      active: true,

      createdBy: req.user.id,

    });

  }

  const created = await InviteCode.insertMany(invites);

  res.json({
    message: `${count} invite codes created`,
    codes: created,
  });

});


/**
 * Disable invite
 */
router.post("/:id/disable", adminAuth, async (req, res) => {

  await InviteCode.findByIdAndUpdate(
    req.params.id,
    {
      active: false,
      revokedAt: new Date(),
    }
  );

  res.json({
    message: "Invite disabled",
  });

});

export default router;