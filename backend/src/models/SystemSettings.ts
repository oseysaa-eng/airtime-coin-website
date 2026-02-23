// src/models/SystemSettings.ts
import mongoose from "mongoose";

const IncidentSchema = new mongoose.Schema({
  active: { type: Boolean, default: false },
  message: { type: String, default: "" },
});

const SystemSettingsSchema = new mongoose.Schema({
  incidentMode: {
    type: IncidentSchema,
    default: () => ({}),
  },

  adsEnabled: { type: Boolean, default: true },
  withdrawalsEnabled: { type: Boolean, default: true },
  stakingEnabled: { type: Boolean, default: true },

  beta: {
  active: { type: Boolean, default: true },
  maxUsers: { type: Number, default: 30 },

  showBalances: { type: Boolean, default: true },
  showConversion: { type: Boolean, default: false },
  showWithdrawals: { type: Boolean, default: false },

  dailyAdLimit: { type: Number, default: 10 },
  dailyMinutesCap: { type: Number, default: 40 },
  inviteOnly: Boolean,   // NEW
  inviteCodes: [String], // NEW
 
}
});

export default mongoose.model(
  "SystemSettings",
  SystemSettingsSchema
);

