import express from "express";
import { adminLimiter } from "../../middleware/adminRateLimiter";
import adminAuth from "../../middleware/adminAuth";

import adminAnalyticsRoutes from "./adminAnalyticsRoutes";
import adminAuditRoutes from "./adminAuditRoutes";
import adminAuthRoutes from "./adminAuthRoutes";
import adminFraudRoutes from "./adminFraudRoutes";
import adminSystemRoutes from "./adminSystemRoutes";
import adminUsersRoutes from "./adminUsersRoutes";
import adminUtilityRoutes from "./adminUtilityRoutes";
import adminDeviceRoutes from "./adminDeviceRoutes";
import adminFraudRadarRoutes from "./adminFraudRadarRoutes";

const router = express.Router();

/* ================= PUBLIC ================= */
router.use("/auth", adminLimiter, adminAuthRoutes);

/* ================= PROTECTED ================= */
router.use(adminAuth);        // 🔒 ALL below require admin
router.use(adminLimiter);     // 🚫 rate limit after auth

/* ================= ROUTES ================= */
router.use("/analytics", adminAnalyticsRoutes);
router.use("/users", adminUsersRoutes);
router.use("/system", adminSystemRoutes);
router.use("/fraud", adminFraudRoutes);
router.use("/audit", adminAuditRoutes);
router.use("/utility", adminUtilityRoutes);
router.use("/devices", adminDeviceRoutes);
router.use("/fraud-radar", adminFraudRadarRoutes);

export default router;