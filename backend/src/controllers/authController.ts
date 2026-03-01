import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User";
import InviteCode from "../models/InviteCode";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = "30d";

/**
 * Generate unique referral code safely
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
 * REGISTER USER
 * Invite-only beta safe
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

    /* ---------------- VALIDATION ---------------- */

    if (!email || !password)
      return res.status(400).json({
        message: "Email and password required",
      });

    if (!inviteCode)
      return res.status(400).json({
        message: "Invite code required",
      });

    /* ---------------- VALIDATE INVITE ---------------- */

    const invite = await InviteCode.findOne({
      code: inviteCode.toUpperCase(),
      active: true,
      usedBy: null,
    });

    if (!invite)
      return res.status(403).json({
        message:
          "Invalid or already used invite code",
      });

    /* ---------------- CHECK USER EXISTS ---------------- */

    const exists = await User.findOne({
      email: email.toLowerCase(),
    });

    if (exists)
      return res.status(409).json({
        message: "User already exists",
      });

    /* ---------------- HASH PASSWORD ---------------- */

    const hash = await bcrypt.hash(password, 12);

    /* ---------------- GENERATE SAFE VALUES ---------------- */

    const referralCode =
      await generateReferralCode();

    const userId =
      new mongoose.Types.ObjectId().toString();

    /* ---------------- CREATE USER ---------------- */

    const user = await User.create({
      userId,

      email: email.toLowerCase(),

      password: hash,

      name: name || "",

      fullName: fullName || "",

      referralCode,

      balance: 0,

      minutes: 0,

      atc: 0,

      rate: 0,

      totalEarnings: 0,

      totalMinutes: 0,

      pushTokens: [],

      earlyAdopter: true,

      role: "user",
    });

    /* ---------------- MARK INVITE USED ---------------- */

    invite.usedBy = user._id;

    invite.usedAt = new Date();

    invite.active = false;

    await invite.save();

    /* ---------------- GENERATE TOKEN ---------------- */

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    /* ---------------- RESPONSE ---------------- */

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user,
    });

  } catch (error: any) {

    console.error(
      "REGISTER CRITICAL ERROR:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });

  }
};

/**
 * LOGIN USER
 */
export const loginUser = async (
  req: Request,
  res: Response
) => {

  try {

    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        message:
          "Email and password required",
      });

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user)
      return res.status(401).json({
        message: "Invalid login",
      });

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid)
      return res.status(401).json({
        message: "Invalid login",
      });

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    return res.json({
      token,
      user,
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Login failed",
    });

  }

};

/**
 * GET CURRENT USER
 */
export const getMe = async (
  req: any,
  res: Response
) => {

  try {

    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    return res.json(user);

  } catch (error) {

    console.error("GET ME ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });

  }

};