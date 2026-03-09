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

export default router;