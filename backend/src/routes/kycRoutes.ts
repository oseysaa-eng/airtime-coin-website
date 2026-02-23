// src/routes/kycRoutes.ts
import express from "express";
import multer from "multer";
import { adminApprove, adminListPending, adminReject, getKycStatus, submitKyc } from "../controllers/kycController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/status", authMiddleware, getKycStatus);
router.post("/submit", authMiddleware, upload.fields([{ name: "front" }, { name: "back" }, { name: "selfie" }]), submitKyc);

// admin
router.get("/admin/pending", authMiddleware, adminListPending); // protect with admin check inside controller
router.post("/admin/:id/approve", authMiddleware, adminApprove);
router.post("/admin/:id/reject", authMiddleware, adminReject);

export default router;
