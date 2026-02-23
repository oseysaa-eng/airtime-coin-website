import express from "express";
import adminAuth from "../../middleware/adminAuthMiddleware";
import UserDevice from "../../models/UserDevice";

const router = express.Router();

/**
 * GET /api/admin/users/:userId/devices
 */
router.get(
  "/users/:userId/devices",
  adminAuth,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const devices = await UserDevice.find({ userId })
        .sort({ lastSeen: -1 })
        .lean();

      res.json({
        count: devices.length,
        devices,
      });
    } catch (err) {
      console.error("ADMIN DEVICES ERROR", err);
      res.status(500).json({
        message: "Failed to load user devices",
      });
    }
  }
);

export default router;