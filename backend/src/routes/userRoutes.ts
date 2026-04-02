import express from "express";
import auth from "../middleware/authMiddleware";
import User from "../models/User";

const router = express.Router();

router.put("/update-profile", auth, async (req:any,res)=>{

  try{

    const userId = req.user.id;

    const { name,email,profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        profileImage
      },
      { new:true }
    );

    res.json({
      success:true,
      user
    });

  }catch(err){

    res.status(500).json({
      message:"Profile update failed"
    });

  }

});

router.post("/notifications/settings", auth, async (req: any, res) => {
  try {
    const { earnings, fraud, promo } = req.body;

    const update: any = {};

    if (earnings !== undefined) update["notifications.earnings"] = earnings;
    if (fraud !== undefined) update["notifications.fraud"] = fraud;
    if (promo !== undefined) update["notifications.promo"] = promo;

    await User.findByIdAndUpdate(req.user.id, update);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update" });
  }
});
export default router;