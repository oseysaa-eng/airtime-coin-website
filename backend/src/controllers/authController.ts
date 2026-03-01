import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User";
import InviteCode from "../models/InviteCode";


const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = "30d";

/**
 * Generate unique referral code
 */
async function generateReferralCode(): Promise<string> {

  while (true) {

    const code =
      "ATC" +
      Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    const exists = await User.findOne({
      referralCode: code,
    });

    if (!exists) return code;

  }

}



/**
 * REGISTER USER — ENTERPRISE SAFE
 */
export const registerUser = async (
  req: Request,
  res: Response
) => {

  try {

    const {
      email,
      password,
      name,
      fullName,
      inviteCode,
    } = req.body;

    if (!email || !password)
      return res.status(400).json({
        message: "Email and password required",
      });

    if (!inviteCode)
      return res.status(400).json({
        message: "Invite code required",
      });

    /**
     * Validate invite
     */
    const invite = await InviteCode.findOne({

      code: inviteCode.toUpperCase(),

      active: true,

      usedBy: null,

    });

    if (!invite)
      return res.status(403).json({
        message: "Invalid or already used invite code",
      });

    /**
     * Check existing user
     */
    const exists = await User.findOne({

      email: email.toLowerCase(),

    });

    if (exists)
      return res.status(409).json({
        message: "User already exists",
      });

    /**
     * Hash password
     */
    const hash = await bcrypt.hash(password, 12);

    /**
     * Generate safe unique values
     */
    const referralCode = await generateReferralCode();

    const userId =
      new mongoose.Types.ObjectId().toString();

    /**
     * Create user
     */
    const user = await User.create({

      userId,

      email: email.toLowerCase(),

      password: hash,

      name,

      fullName,

      referralCode,

      balance: 0,

      minutes: 0,

      atc: 0,

      rate: 0,

      totalEarnings: 0,

      totalMinutes: 0,

      pushTokens: [],

      earlyAdopter: true,

    });

    /**
     * Mark invite used
     */
    invite.usedBy = user._id;

    invite.usedAt = new Date();

    invite.active = false;

    await invite.save();

    /**
     * Generate token
     */
    const token = jwt.sign(

      { id: user._id },

      JWT_SECRET,

      { expiresIn: JWT_EXPIRES_IN }

    );

    return res.status(201).json({

      message: "Registered successfully",

      token,

      user,

    });

  }

  catch (error: any) {

    console.error(
      "REGISTER CRITICAL ERROR:",
      error
    );

    return res.status(500).json({

      message: "Server error",

      error: error.message,

    });

  }

};