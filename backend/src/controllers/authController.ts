³import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/jwt";
import InviteCode from "../models/InviteCode";
import SystemSettings from "../models/SystemSettings";
import User from "../models/User";

import { sendDeviceOTP } from "../services/deviceOtpService";
import { verifyDevice } from "../services/deviceTrustService";
import { getReferralCode } from "./referralController";

/* =====================================================
   📝 REGISTER USER — ENTERPRISE SAFE
===================================================== */
export const registerUser = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    /* ================= NORMALIZE INPUT ================= */

    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const name = req.body.name?.trim();
    const fullName = req.body.fullName?.trim();
    const referralCode = req.body.referralCode?.trim() || null;
    const inviteCode = req.body.inviteCode?.trim() || null;

    if (!email || !password) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    /* ================= SYSTEM SETTINGS ================= */

    const settings =
      (await SystemSettings.findOne().session(session)) ||
      (await SystemSettings.create([{}], { session }).then(r => r[0]));

    /* ================= BETA VALIDATION ================= */

    let inviteDoc: any = null;

    if (settings.beta?.active) {

      const userCount = await User.countDocuments().session(session);

      if (userCount >= settings.beta.maxUsers) {
        await session.abortTransaction();
        return res.status(403).json({
          message: "Beta is currently full",
        });
      }

      if (settings.beta.inviteOnly) {

        if (!inviteCode) {
          await session.abortTransaction();
          return res.status(403).json({
            message: "Invite code required",
          });
        }

        inviteDoc = await InviteCode.findOne({
          code: inviteCode,
          active: true,
          usedBy: null,
        }).session(session);

        if (!inviteDoc) {
          await session.abortTransaction();
          return res.status(403).json({
            message: "Invalid invite code",
          });
        }
      }
    }

    /* ================= DUPLICATE CHECK ================= */

    const exists = await User.findOne({ email }).session(session);

    if (exists) {
      await session.abortTransaction();
      return res.status(409).json({
        message: "User already exists",
      });
    }

    /* ================= PASSWORD HASH ================= */

    const hash = await bcrypt.hash(password, 12);

    /* ================= USER ID GENERATION ================= */

    const userId = new mongoose.Types.ObjectId().toString();

    /* ================= EARLY ADOPTER ================= */

    const kycStart = new Date(
      process.env.KYC_START_DATE || Date.now()
    );

    const isEarly = new Date() < kycStart;

    /* ================= CREATE USER ================= */

    const user = await User.create(
      [
        {
          userId,

          email,
          password: hash,

          name,
          fullName,

          /* Wallet Initialization */
          minutes: 0,
          atc: 0,
          rate: 0,

          /* Push tokens must be ARRAY */
          pushTokens: [],

          /* Profile */
          profile: {
            avatar: "",
            phone: "",
            country: "",
          },

          /* Beta */
          earlyAdopter: isEarly,
          betaStatus: "approved",

          /* Referral */
          referral: {
            code: Math.random()
              .toString(36)
              .substring(2, 10),
            referredBy: referralCode,
            referredUsers: [],
            referralEarnings: 0,
          },

          /* Stats */
          donationTotal: 0,
          donorBadge: "none",

          totalEarnings: 0,
          totalMinutes: 0,

          chartData: [],

          kycStatus: "not_submitted",
        },
      ],
      { session }
    ).then(r => r[0]);

    /* ================= MARK INVITE USED ================= */

    if (inviteDoc) {
      inviteDoc.usedBy = user._id;
      inviteDoc.usedAt = new Date();
      inviteDoc.active = false;

      await inviteDoc.save({ session });
    }

    /* ================= REFERRAL PROCESSING ================= */

    if (referralCode) {
      await getReferralCode(
        user._id.toString(),
        referralCode
      );
    }

    /* ================= JWT ================= */

    const token = jwt.sign(
      {
        id: user._id,
        userId: user.userId,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    await session.commitTransaction();

    /* ================= RESPONSE ================= */

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        id: user._id,
        userId: user.userId,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
      },
    });

  } catch (err) {

    await session.abortTransaction();

    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      message: "Server error",
    });

  } finally {

    session.endSession();

  }
};