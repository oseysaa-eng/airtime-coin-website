import express from "express";
import auth from "../middleware/authMiddleware";
import ReferralModel from "../models/Referral";
import { creditUser } from "../services/creditService";

const router = express.Router();

router.post("/create", auth, async (req: any, res) => {
  const userId = req.user.id;

  let r = await ReferralModel.findOne({ userId });
  if (!r) r = await ReferralModel.create({ userId, code: ReferralModel.generateCode() });

  res.json({ code: r.code });
});

router.post("/apply", auth, async (req: any, res) => {
  const { code } = req.body;
  const userId = req.user.id;

  const referral = await ReferralModel.findOne({ code });
  if (!referral) return res.status(400).json({ message: "Invalid code" });

  if (String(referral.userId) === String(userId))
    return res.status(400).json({ message: "Cannot use your own code" });

  await creditUser(req.app.get("io"), userId, 5, "REFERRAL_SIGNUP");
  await creditUser(req.app.get("io"), String(referral.userId), 10, "REFERRAL_REWARD");

  res.json({ success: true });
});

export default router;
