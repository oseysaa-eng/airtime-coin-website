import express from "express";
import { getUserSummary } from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

// GET /api/user/summary
router.get("/summary", authMiddleware, getUserSummary);


export default router;



