import express from "express";
import adminAuth from "../../middleware/adminAuth";
import ATCPrice from "../../models/ATCPrice";
import AdminAuditLog from "../../models/AdminAuditLog";

const router = express.Router();

/**
 * GET current price
 */
router.get("/", adminAuth, async (_req, res) => {
  const price = await ATCPrice.findOne();
  res.json(price);
});

/**
 * POST set manual price
 */
router.post("/manual", adminAuth, async (req: any, res) => {
  const { price } = req.body;

  if (!price || price <= 0) {
    return res.status(400).json({ message: "Invalid price" });
  }

  await ATCPrice.findOneAndUpdate(
    {},
    {
      mode: "MANUAL",
      manualPrice: price,
      currentPrice: price,
    },
    { upsert: true }
  );

  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "PRICE_MANUAL",
    meta: { price },
  });

  res.json({ success: true, price });
});

/**
 * FREEZE
 */
router.post("/freeze", adminAuth, async (req: any, res) => {
  const { reason } = req.body;

  await ATCPrice.findOneAndUpdate(
    {},
    {
      mode: "FROZEN",
      freezeReason: reason,
    },
    { upsert: true }
  );

  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "PRICE_FROZEN",
    meta: { reason },
  });

  res.json({ success: true });
});

/**
 * UNFREEZE (back to auto)
 */
router.post("/auto", adminAuth, async (_req, res) => {
  await ATCPrice.findOneAndUpdate(
    {},
    {
      mode: "AUTO",
      manualPrice: null,
      freezeReason: null,
    }
  );

  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "PRICE_AUTO",
  });

  res.json({ success: true });
});

export default router;