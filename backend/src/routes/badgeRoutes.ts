import express from "express";
import { getBadgeInfo } from "../controllers/badgeController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware, getBadgeInfo);

export default router;
