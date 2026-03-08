import mongoose from "mongoose";

const HalvingStateSchema = new mongoose.Schema(
{
  phase: {
    type: Number,
    default: 0
  },

  baseReward: {
    type: Number,
    default: 5
  },

  lastHalving: {
    type: Date,
    default: Date.now
  }
},
{ timestamps:true }
);

export default mongoose.model("HalvingState",HalvingStateSchema);