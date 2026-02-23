import express from "express";
import adminAuth from "../middleware/adminAuth";
import SupportMessage from "../models/SupportMessage";
import SupportTicket from "../models/SupportTicket";

const router = express.Router();

/* ALL TICKETS */
router.get("/tickets", adminAuth, async (_req, res) => {
  const tickets = await SupportTicket.find()
    .populate("userId", "email name")
    .sort({ lastMessageAt: -1 });

  res.json(tickets);
});

/* MESSAGES */
router.get(
  "/tickets/:id/messages",
  adminAuth,
  async (req, res) => {
    const messages = await SupportMessage.find({
      ticketId: req.params.id,
    }).sort({ createdAt: 1 });

    res.json(messages);
  }
);

/* ADMIN SEND MESSAGE */
router.post(
  "/tickets/:id/message",
  adminAuth,
  async (req, res) => {
    const msg = await SupportMessage.create({
      ticketId: req.params.id,
      sender: "ADMIN",
      message: req.body.message,
    });

    res.json(msg);
  }
);

export default router;