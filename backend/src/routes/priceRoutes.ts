import express from "express";
import ATCPrice from "../models/ATCPrice";
import ATCPriceHistory from "../models/ATCPriceHistory";

const router = express.Router();

/* ================= GET CURRENT PRICE ================= */
router.get("/", async (_req, res) => {
  try {
    const price = await ATCPrice.findOne()
      .sort({ updatedAt: -1 })
      .lean();

    // 🟢 SAFE FALLBACK (first launch)
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
      previous: price.previousPrice ?? price.currentPrice,
      changePercent: Number(price.changePercent ?? 0),
      trend: price.trend ?? "flat",
      updatedAt: price.updatedAt,
      mode: price.mode ?? "AUTO",
    });

  } catch (err) {
    console.error("PRICE ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch price",
    });
  }
});

/* ================= GET PRICE HISTORY ================= */
router.get("/history", async (req, res) => {
  try {
    let days = parseInt(req.query.days as string) || 7;

    // 🔒 VALIDATION
    if (isNaN(days) || days <= 0) days = 7;
    if (days > 90) days = 90;

    const from = new Date();
    from.setDate(from.getDate() - days);

    const history = await ATCPriceHistory.find({
      createdAt: { $gte: from },
    })
      .sort({ createdAt: 1 })
      .select("price createdAt -_id")
      .lean();

    res.json(history);

  } catch (err) {
    console.error("PRICE HISTORY ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch price history",
    });
  }
});

export default router;