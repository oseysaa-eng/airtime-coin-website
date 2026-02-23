import mongoose from "mongoose";

const TaskLogSchema = new mongoose.Schema(
  {
    network: String,
    userId: String,
    taskId: { type: String, unique: true },
    rewardMinutes: Number,
    ip: String,
    country: String,
  },
  { timestamps: true }
);

export default mongoose.model("TaskLog", TaskLogSchema);
