import mongoose, { Document, Schema } from "mongoose";

export interface IUserTrust extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  lastDecayAt?: Date;
  lastRecoveryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  trustScore: Number;
  flags: {
  multiAccount: Boolean;
  emulator: Boolean;
  rapidSwitch: Boolean;
},
}

const UserTrustSchema = new Schema<IUserTrust>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    trustScore: { type: Number, default: 100 },
    flags: {
      multiAccount: { type: Boolean, default: false },
      emulator: { type: Boolean, default: false },
      rapidSwitch: { type: Boolean, default: false },
    },
    score: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    lastDecayAt: {
      type: Date,
    },

    lastRecoveryAt: {
      type: Date,
    },
  },
  { timestamps: true }

);

export default mongoose.model<IUserTrust>(
  "UserTrust",
  UserTrustSchema
);



