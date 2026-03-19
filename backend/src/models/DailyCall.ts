
import mongoose from "mongoose";
const DailyCallSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,

  date: { type: String, index: true },

  minutes: { type: Number, default: 0 },

});

export default mongoose.model("DailyCall", DailyCallSchema);