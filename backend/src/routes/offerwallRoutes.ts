import express from "express";
import { creditUser } from "../services/creditService";

const router = express.Router();

// Example GET postback: /api/offerwall/postback?userId=xxx&reward=20
router.get("/postback", async (req: any, res) => {
  try {
    const { userId, reward } = req.query;
    if (!userId || !reward) return res.status(400).send("missing params");

    const minutes = Number(reward);
    await creditUser(req.app.get("io"), String(userId), minutes, "OFFERWALL_POSTBACK");

    // respond 200 to partner
    res.send("OK");
  } catch (e) {
    console.error(e);
    res.status(500).send("ERR");
  }
});

export default router;
