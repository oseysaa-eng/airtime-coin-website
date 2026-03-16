import express from "express";
import { adminLimiter } from "../../middleware/adminRateLimiter";

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

// 🔒 Rate limit ALL admin endpoints
router.use(adminLimiter);

// 🔐 Auth
router.use("/auth", adminAuthRoutes);

// 📊 Analytics
router.use("/analytics", adminAnalyticsRoutes);

// 👥 Users
router.use("/users", adminUsersRoutes);

// ⚙️ System
router.use("/system", adminSystemRoutes);

// 🚨 Fraud
router.use("/fraud", adminFraudRoutes);

// 🧾 Audit
router.use("/audit", adminAuditRoutes);

router.use("/utility", adminUtilityRoutes);

router.use("/devices", adminDeviceRoutes);

router.use("/fraud-radar", adminFraudRadarRoutes);

export default router;