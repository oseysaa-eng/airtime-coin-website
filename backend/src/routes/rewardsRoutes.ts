import express from "express";
import { creditRewardController } from "../controllers/rewardController";
import auth from "../middleware/authMiddleware";

const router = express.Router();

router.post("/credit", auth, creditRewardController);

export default router;
