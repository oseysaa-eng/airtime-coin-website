import express from "express";
import ATCPrice from "../models/ATCPrice";
import ATCPriceHistory from "../models/ATCPriceHistory";

const router = express.Router();

/**
 * GET /api/price
 * Public ATC price endpoint
 */
router.get("/", async (_req, res) => {
  const price = await ATCPrice.findOne().sort({ updatedAt: -1 });

  // 🟢 Safe fallback (first launch)
  if (!price) {
    return res.json({
      price: 0,
      previous: 0,
      changePercent: 0,
      trend: "flat",
      updatedAt: new Date(),
      mode: "AUTO",
    });
  }

  res.json({
    price: price.currentPrice,
    previous: price.previousPrice || price.currentPrice,
    changePercent: Number(price.changePercent || 0),
    trend: price.trend || "flat",
    updatedAt: price.updatedAt,
    mode: price.mode || "AUTO",
  });
});

/**
 * GET /api/price/history?days=7
 */
router.get("/history", async (req, res) => {
  const days = Math.min(Number(req.query.days || 7), 90);

  const from = new Date();
  from.setDate(from.getDate() - days);

  const history = await ATCPriceHistory.find({
    createdAt: { $gte: from },
  })
    .sort({ createdAt: 1 })
    .select("price createdAt -_id");

  res.json(history);
});

export default router;