import mongoose from "mongoose";

const AdRewardSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  adRewardId: {
    type: String,
    required: true,
    unique: true
  },

  network: String,

  rewardMinutes: Number
},
{ timestamps: true }
);

export default mongoose.model("AdReward", AdRewardSchema);