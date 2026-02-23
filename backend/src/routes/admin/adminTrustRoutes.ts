import express from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminAuditLog from "../../models/AdminAuditLog";
import UserTrust from "../../models/UserTrust";

const router = express.Router();

/**
 * UPDATE trust score
 */
router.post("/:userId", adminAuth, async (req, res) => {
  const { score } = req.body;
  const { userId } = req.params;

  if (typeof score !== "number" || score < 0 || score > 100) {
    return res.status(400).json({ message: "Invalid trust score" });
  }

  const trust =
    (await UserTrust.findOne({ userId })) ||
    (await UserTrust.create({ userId }));

  const oldScore = trust.score;
  trust.score = score;
  await trust.save();

  // 🔒 Audit log
  await AdminAuditLog.create({
    adminId: req.admin._id,
    action: "UPDATE_TRUST",
    targetUserId: userId,
    meta: { from: oldScore, to: score },
  });

  res.json({ success: true });
});

export default router;
