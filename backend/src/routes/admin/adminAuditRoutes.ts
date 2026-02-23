import express from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminAuditLog from "../../models/AdminAuditLog";

const router = express.Router();

/**
 * GET /admin/audit
 */
router.get("/", adminAuth, async (_req, res) => {
  const logs = await AdminAuditLog.find()
    .populate("adminId", "email")
    .populate("targetUserId", "email")
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(logs);
});

export default router;
