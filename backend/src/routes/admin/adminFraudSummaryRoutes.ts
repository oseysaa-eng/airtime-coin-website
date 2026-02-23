import express from "express";
import adminAuth from "../../middleware/adminAuth";
import CallSession from "../../models/CallSession";
import Transaction from "../../models/Transaction";
import UserTrust from "../../models/UserTrust";

const router = express.Router();

router.get("/:id/fraud-summary", adminAuth, async (req, res) => {
  const { id } = req.params;

  const flaggedCalls = await CallSession.countDocuments({
    userId: id,
    flagged: true,
  });

  const repeatedPatterns = await CallSession.countDocuments({
    userId: id,
    flagReason: "Repeated call pattern",
  });

  const ipAbuse = await CallSession.countDocuments({
    userId: id,
    flagReason: "IP abuse",
  });

  const surveyAbuse = await Transaction.countDocuments({
    userId: id,
    source: "SURVEY",
    flagged: true,
  });

  const trust = await UserTrust.findOne({ userId: id });

  res.json({
    flaggedCalls,
    repeatedPatterns,
    ipAbuse,
    surveyAbuse,
    trustScore: trust?.score ?? 100,
  });
});

export default router;