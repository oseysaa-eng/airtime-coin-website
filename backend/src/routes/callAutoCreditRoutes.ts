import express from "express";
import auth from "../middleware/authMiddleware";
import Wallet from "../models/Wallet";
import CallSession from "../models/CallSession";

const router = express.Router();

router.post("/auto-credit", auth, async (req:any,res)=>{

  const { seconds } = req.body;

  const minutes = Math.floor(seconds / 60);

  if(minutes < 5){
    return res.json({ credited: 0 });
  }

  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);

  const todayCalls = await CallSession.aggregate([
    {
      $match:{
        userId:req.user.id,
        createdAt:{ $gte: todayStart }
      }
    },
    {
      $group:{
        _id:null,
        total:{ $sum:"$minutes" }
      }
    }
  ]);

  const todayTotal = todayCalls[0]?.total || 0;

  if(todayTotal >= 100){
    return res.json({ credited:0 });
  }

  const allowed = Math.min(minutes, 100 - todayTotal);

  const wallet = await Wallet.findOne({ userId:req.user.id });

  wallet.totalMinutes += allowed;
  await wallet.save();

  await CallSession.create({
    userId:req.user.id,
    durationSeconds:seconds,
    minutes:allowed
  });

  res.json({ credited:allowed });

});

export default router;