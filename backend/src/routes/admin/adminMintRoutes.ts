import express from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminMintLog from "../../models/AdminMintLog";
import SystemSupply from "../../models/SystemSupply";

const router = express.Router();

/**
 * GET /admin/mint/status
 */
router.get("/status", adminAuth, async (_req, res) => {
  const supply =
    (await SystemSupply.findOne()) ||
    (await SystemSupply.create({}));

  res.json(supply);
});

/**
 * POST /admin/mint
 */
router.post("/", adminAuth, async (req: any, res) => {
  const { amount, reason, target } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid mint amount" });
  }

  const supply =
    (await SystemSupply.findOne()) ||
    (await SystemSupply.create({}));

  if (supply.mintPaused) {
    return res.status(403).json({ message: "Minting is paused" });
  }

  if (supply.totalMinted + amount > supply.maxSupply) {
    return res.status(403).json({ message: "Max supply exceeded" });
  }

  supply.totalMinted += amount;
  await supply.save();

  await AdminMintLog.create({
    adminId: req.admin._id,
    amount,
    reason,
    target,
  });

  res.json({
    success: true,
    totalMinted: supply.totalMinted,
  });
});

/**
 * PATCH /admin/mint/pause
 */
router.patch("/pause", adminAuth, async (req, res) => {
  const { paused } = req.body;

  const supply =
    (await SystemSupply.findOne()) ||
    (await SystemSupply.create({}));

  supply.mintPaused = !!paused;
  await supply.save();

  res.json(supply);
});

export default router;
