// src/models/EmissionState.ts
import mongoose from "mongoose";

const EmissionStateSchema = new mongoose.Schema(
  {
  phase: { type: Number, default: 0 },          // 0,1,2,3...
  multiplier: { type: Number, default: 1 },     // 1, 0.5, 0.25...
  lastHalvingAt: { type: Date, default: Date.now },
    totalMinutesMined: {type: Number,default: 0},
    currentReward: {type: Number, default: 5},
},
{ timestamps:true }
);

export default mongoose.model("EmissionState", EmissionStateSchema);

