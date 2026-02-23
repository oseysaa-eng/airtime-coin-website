// src/models/AdminAuditLog.ts
import mongoose from "mongoose";

const AdminAuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    action: String,
    meta: Object,
  },
  { timestamps: true }
);

export default mongoose.model("AdminAuditLog", AdminAuditLogSchema);
