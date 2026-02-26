import express from "express";
import adminAuth from "../../middleware/adminAuth";
import AdminAuditLog from "../../models/AdminAuditLog";

const router = express.Router();

/**
 * GET /api/admin/audit
 * Returns paginated audit logs
 */
router.get("/", adminAuth, async (req, res) => {

  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const skip = (page - 1) * limit;

    const total = await AdminAuditLog.countDocuments();

    const logs = await AdminAuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({

      logs,

      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }

    });

  } catch (err: any) {

    console.error("AUDIT ROUTE ERROR:", err);

    res.status(500).json({
      message: "Failed to load audit logs"
    });

  }

});

export default router;