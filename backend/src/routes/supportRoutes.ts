import express from "express";
import auth from "../middleware/authMiddleware";
import SupportMessage from "../models/SupportMessage";
import SupportTicket from "../models/SupportTicket";

const router = express.Router();

/* CREATE OR GET TICKET */
router.get("/ticket", auth, async (req: any, res) => {
  let ticket = await SupportTicket.findOne({
    userId: req.user.id,
    status: "OPEN",
  });

  if (!ticket) {
    ticket = await SupportTicket.create({
      userId: req.user.id,
    });
  }

  const messages = await SupportMessage.find({
    ticketId: ticket._id,
  }).sort({ createdAt: 1 });

  res.json({ ticket, messages });
});

/* SEND MESSAGE */
router.post("/message", auth, async (req: any, res) => {
  const { ticketId, message } = req.body;

  const msg = await SupportMessage.create({
    ticketId,
    sender: "USER",
    message,
  });

  await SupportTicket.findByIdAndUpdate(ticketId, {
    lastMessageAt: new Date(),
  });

  res.json(msg);
});

export default router;