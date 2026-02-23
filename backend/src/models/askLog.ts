// models/TaskLog.ts
import mongoose from "mongoose";

const TaskLogSchema = new mongoose.Schema({
  userId: String,
  taskType: String,
  taskId: String,
  date: String,
});

export default mongoose.model("TaskLog", TaskLogSchema);
