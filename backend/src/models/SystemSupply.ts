import mongoose from "mongoose";

const SystemSupplySchema = new mongoose.Schema(
  {
    totalMinted: { type: Number, default: 0 },
    mintPaused: { type: Boolean, default: false },
    maxSupply: { type: Number, default: 21000000 }, // example cap
  },
  { timestamps: true }
);

export default mongoose.model("SystemSupply", SystemSupplySchema);
