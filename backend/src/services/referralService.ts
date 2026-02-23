// src/services/referralService.ts
import mongoose from "mongoose";
import ReferralHistory from "../models/ReferralHistory";
import WalletTxn from "../models/Transaction"; // optional: if you keep transactions
import User from "../models/User";
import API from "./API";

export const getReferralCode = async () => {
  const res = await API.get("/referral/code");
  return res.data;
};

export const getReferralStats = async () => {
  const res = await API.get("/referral/stats");
  return res.data;
};


/**
 * Config - adjust as needed or load from env
 */
const REFERRAL_REGISTER_REWARD = Number(process.env.REFERRAL_REGISTER_REWARD ?? 2); // ATC credited to inviter
const REFERRAL_FIRST_DEPOSIT_REWARD = Number(process.env.REFERRAL_FIRST_DEPOSIT_REWARD ?? 1); // optional

/**
 * Anti-abuse checks:
 * - Prevent self-referral
 * - Prevent inviter being same IP or same device (if you record device/IP)
 * - Only one reward per invited user per reason
 */

export async function applyReferralOnRegister(invitedUser: any, referralCode?: string, meta?: { ip?:string, deviceId?:string }) {
  if (!referralCode) return null;

  // find inviter
  const inviter = await User.findOne({ referralCode: referralCode.trim() });
  if (!inviter) return null;

  // Prevent self-referral (same email)
  if (String(inviter._id) === String(invitedUser._id)) return null;

  // Prevent multiple rewards for same invited user (idempotency)
  const existing = await ReferralHistory.findOne({
    invitedId: invitedUser._id,
    reason: "register",
  });
  if (existing) return null;

  // OPTIONAL: Additional anti-abuse checks (IPs/device)
  // if (meta?.ip && inviter.lastKnownIP && meta.ip === inviter.lastKnownIP) return null;

  // Perform reward in transaction
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // credit inviter balance and increment counters
    inviter.balance = (inviter.balance || 0) + REFERRAL_REGISTER_REWARD;
    inviter.inviteCount = (inviter.inviteCount || 0) + 1;
    inviter.earnedFromReferrals = (inviter.earnedFromReferrals || 0) + REFERRAL_REGISTER_REWARD;
    await inviter.save({ session });

    // mark invited user as referredBy
    invitedUser.referredBy = inviter.referralCode;
    await invitedUser.save({ session });

    // create referral history record
    await ReferralHistory.create(
      [
        {
          inviterId: inviter._id,
          invitedId: invitedUser._id,
          invitedEmail: invitedUser.email,
          reward: REFERRAL_REGISTER_REWARD,
          reason: "register",
        },
      ],
      { session }
    );

    // Optionally create wallet transaction record if you keep transaction ledger
    if (WalletTxn) {
      await WalletTxn.create(
        [
          {
            userId: inviter._id,
            type: "credit",
            amount: REFERRAL_REGISTER_REWARD,
            meta: { reason: "referral_register", invitedId: invitedUser._id },
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return { inviterId: inviter._id, reward: REFERRAL_REGISTER_REWARD };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("applyReferralOnRegister error:", err);
    return null;
  }
}

/**
 * Fetch referral summary + basic stats for a user
 */
export async function getReferralSummary(userId: string) {
  const user = await User.findById(userId).select("referralCode inviteCount earnedFromReferrals");
  if (!user) return null;
  return {
    referralCode: user.referralCode,
    inviteCount: user.inviteCount || 0,
    earnedATC: user.earnedFromReferrals || 0,
  };
}

/**
 * List referral history for inviter
 */
export async function listReferralHistory(inviterId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [rows, total] = await Promise.all([
    ReferralHistory.find({ inviterId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ReferralHistory.countDocuments({ inviterId }),
  ]);
  return { total, page, limit, rows };
}
