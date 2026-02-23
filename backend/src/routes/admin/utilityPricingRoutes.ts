import express from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminAuditLog from "../../models/AdminAuditLog";
import UtilityPricing from "../../models/UtilityPricing";

const router = express.Router();

/**
 * GET pricing config
 */
router.get("/", adminAuth, async (_req, res) => {
  const pricing =
    (await UtilityPricing.findOne()) ||
    (await UtilityPricing.create({}));

  res.json(pricing);
});

/**
 * UPDATE pricing config
 */
router.post("/", adminAuth, async (req: any, res) => {
  const { basePrice, minPrice, maxPrice } = req.body;

  const pricing =
    (await UtilityPricing.findOne()) ||
    (await UtilityPricing.create({}));

  pricing.basePrice = basePrice;
  pricing.minPrice = minPrice;
  pricing.maxPrice = maxPrice;
  pricing.updatedAt = new Date();

  await pricing.save();

  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "UTILITY_PRICING_UPDATED",
    meta: { basePrice, minPrice, maxPrice },
  });

  res.json(pricing);
});

export default router;