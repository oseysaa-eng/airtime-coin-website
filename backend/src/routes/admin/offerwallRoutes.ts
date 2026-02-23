import express from "express";
import Offer from "../../models/Offer";
import Transaction from "../../models/Transaction";
import { creditUser } from "../../services/creditService";

const router = express.Router();

/**
 * ADMIN AUTH
 */
const adminAuth = (req, res, next) => {
  if (req.header("x-admin-key") !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

router.use(adminAuth);

/**
 * GET ALL OFFERS
 */
router.get("/", async (req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 });
  res.json(offers);
});

/**
 * APPROVE OFFER
 */
router.post("/:id/approve", async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: "Offer not found" });

  if (offer.status === "approved") {
    return res.status(400).json({ message: "Already approved" });
  }

  offer.status = "approved";
  await offer.save();

  await creditUser(
    req.app.get("io"),
    offer.userId,
    offer.rewardMinutes,
    "OFFERWALL"
  );

  res.json({ success: true });
});

/**
 * REJECT OFFER
 */
router.post("/:id/reject", async (req, res) => {
  const offer = await Offer.findById(req.params.id);
  if (!offer) return res.status(404).json({ message: "Offer not found" });

  offer.status = "rejected";
  await offer.save();

  res.json({ success: true });
});

/**
 * STATS
 */
router.get("/stats", async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const daily = await Transaction.aggregate([
    { $match: { category: "OFFERWALL", createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalMinutes: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ daily });
});

export default router;
