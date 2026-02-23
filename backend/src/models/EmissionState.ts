// src/models/EmissionState.ts
import mongoose from "mongoose";

const EmissionStateSchema = new mongoose.Schema({
  phase: { type: Number, default: 0 },          // 0,1,2,3...
  multiplier: { type: Number, default: 1 },     // 1, 0.5, 0.25...
  lastHalvingAt: { type: Date, default: Date.now },
});

export default mongoose.model("EmissionState", EmissionStateSchema);
