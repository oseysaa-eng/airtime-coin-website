import express from "express";
import adminAuth from "../../middleware/adminAuth";
import FraudEvent from "../../models/FraudEvent";

const router = express.Router();

router.get("/", adminAuth, async (_req,res)=>{

  const events = await FraudEvent
    .find()
    .sort({ createdAt:-1 })
    .limit(50);

  res.json(events);

});

export default router;