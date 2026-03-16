import mongoose, { Document, Schema } from "mongoose";

export interface IUserTrust extends Document {

  userId: mongoose.Types.ObjectId;

  score: number;

  flags: {
    multiAccount: boolean;
    emulator: boolean;
    rapidSwitch: boolean;
  };

  reasons?: string[];

  lastDecayAt?: Date;
  lastRecoveryAt?: Date;
  lastSeenAt: Date;

  createdAt: Date;
  updatedAt: Date;

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

    score: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    flags: {

      multiAccount: {
        type: Boolean,
        default: false,
      },

      emulator: {
        type: Boolean,
        default: false,
      },

      rapidSwitch: {
        type: Boolean,
        default: false,
      },

    },

    reasons: [String],

    lastDecayAt: Date,
    lastRecoveryAt: Date,
    lastSeenAt: Date,

  },
  { timestamps: true }
);

export default mongoose.model<IUserTrust>(
  "UserTrust",
  UserTrustSchema
);