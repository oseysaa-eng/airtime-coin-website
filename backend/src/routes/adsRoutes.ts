import express from "express";
import auth from "../middleware/authMiddleware";

import AdReward from "../models/AdReward";
import RewardPool from "../models/RewardPool";
import SystemSettings from "../models/SystemSettings";
import UserDailyStats from "../models/UserDailyStats";
import UserTrust from "../models/UserTrust";

import { verifyAdSignature } from "../utils/adSignature";
import { rewardEngine } from "../services/rewardEngine";

const router = express.Router();

router.post("/complete", auth, async (req:any,res) => {

  try{

    const userId = req.user.id;

    const {
      adRewardId,
      network,
      rewardMinutes,
      signature
    } = req.body;

    if(!adRewardId || !rewardMinutes)
      return res.status(400).json({
        message:"Missing parameters"
      });

   // if(!verifyAdSignature(req.body,signature))
      //return res.status(403).json({
       // message:"Invalid ad signature" });

       // TEMP: disable signature validation during beta
if (signature && !verifyAdSignature(req.body, signature)) {
  console.log("⚠️ Invalid ad signature (ignored in beta)");
}

    const duplicate = await AdReward.findOne({adRewardId});

    if(duplicate)
      return res.json({
        success:true,
        creditedMinutes:0,
        duplicate:true
      });

    const settings = await SystemSettings.findOne();

    if(settings?.incidentMode?.active)
      return res.status(403).json({
        message:"System unavailable"
      });

    const pool = await RewardPool.findOne({type:"ADS"});

    if(!pool || pool.paused)
      return res.status(403).json({
        message:"Ads paused"
      });

    const trust =
      (await UserTrust.findOne({userId})) ||
      (await UserTrust.create({userId}));

    if(trust.score < 40)
      return res.status(403).json({
        message:"Trust blocked"
      });

    let multiplier = 1;

    if(trust.score < 80) multiplier = 0.75;
    if(trust.score < 60) multiplier = 0.4;

    const creditedMinutes =
      Math.floor(rewardMinutes * multiplier);

    if(creditedMinutes <= 0)
      return res.json({
        success:true,
        creditedMinutes:0
      });

    const today = new Date().toISOString().slice(0,10);

    let stats =
      await UserDailyStats.findOne({userId,date:today});

    if(!stats)
      stats = await UserDailyStats.create({
        userId,
        date:today
      });

    if(stats.adsWatched >= 10)
      return res.status(403).json({
        message:"Daily ad limit reached"
      });

    const io = req.app.get("io");

    await rewardEngine({
      userId,
      minutes: creditedMinutes,
      source: "ADS",
      meta:{ network, adRewardId },
      io
    });

    stats.adsWatched += 1;
    stats.minutesEarned += creditedMinutes;

    await stats.save();

    await AdReward.create({
      userId,
      adRewardId,
      network,
      rewardMinutes: creditedMinutes
    });

    res.json({
      success:true,
      creditedMinutes
    });

  }catch(err){

    console.error("ADS REWARD ERROR:",err);

    res.status(500).json({
      message:"Ad reward failed"
    });

  }

});

export default router;