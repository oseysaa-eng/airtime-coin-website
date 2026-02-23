// src/routes/surveys.ts
import crypto from "crypto";
import express from "express";
import SystemSettings from "../models/SystemSettings";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";

const router = express.Router();

/**
 * Example: partner will POST to /api/surveys/postback
 * Body should include: { userId, rewardMinutes, externalId, signature } — signature is HMAC of payload with shared secret
 */

// configure a shared secret between you and the partner
const PARTNER_SECRET = process.env.OFFERWALL_SECRET || "replace_me";

router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    // 🔐 Check global reward pause FIRST
 const settings = await SystemSettings.findOne();
if (settings?.incidentMode?.active) {
  return res.status(403).json({
    message: "System temporarily unavailable",
    incident: settings.incidentMode.message,
  });
}
    const signature =
      payload.signature || req.headers["x-postback-signature"];

    if (!signature) return res.status(400).send("missing signature");

    const h = crypto.createHmac("sha256", PARTNER_SECRET);
    h.update(
      `${payload.userId}|${payload.externalId}|${payload.rewardMinutes}`
    );
    const expected = h.digest("hex");

    if (signature !== expected)
      return res.status(401).send("invalid signature");

    const existing = await Transaction.findOne({
      reference: payload.externalId,
    });
    if (existing) return res.status(200).send("already processed");

    const reward = Number(payload.rewardMinutes);
    if (!reward || reward <= 0)
      return res.status(400).send("invalid reward");

    let wallet = await Wallet.findOne({ userId: payload.userId });
    if (!wallet) wallet = await Wallet.create({ userId: payload.userId });

    wallet.totalMinutes += reward;
    wallet.todayMinutes += reward;
    await wallet.save();

    await Transaction.create({
      userId: payload.userId,
      type: "EARN",
      amount: reward,
      source: "SURVEY",
      reference: payload.externalId,
    });

    res.status(200).send("ok");
  } catch (e) {
    console.error("survey.postback error", e);
    res.status(500).send("error");
  }
});

export default router;
