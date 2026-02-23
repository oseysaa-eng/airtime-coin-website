import express from "express";
import { donationHistory, sendDonation } from "../controllers/donationController";
import authMiddleware from "../middleware/authMiddleware";
import requireKYC from "../middleware/requireKYC";

const router = express.Router();

router.post("/", authMiddleware, requireKYC, sendDonation);
router.get("/", authMiddleware, requireKYC, donationHistory);

export default router;
