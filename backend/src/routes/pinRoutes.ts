import express from "express";
import { getPin, savePin, verifyPin } from "../controllers/pinController";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getPin);
router.post("/", authMiddleware, savePin);
router.post("/verify", authMiddleware, verifyPin);

export default router;
