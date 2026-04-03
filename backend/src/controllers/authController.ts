import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User";


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
      referralCode, // OPTIONAL now
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (!email || !password)
      return res.status(400).json({
        message: "Email and password required",
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

    /* ---------------- GENERATE USER REFERRAL CODE ---------------- */

    const newReferralCode =
      await generateReferralCode();

    const userId =
      new mongoose.Types.ObjectId().toString();

    /* ---------------- OPTIONAL REFERRAL VALIDATION ---------------- */

    let referredBy = null;

    if (referralCode) {
      const refUser = await User.findOne({
        referralCode: referralCode.toUpperCase(),
      });

      if (refUser) {
        referredBy = refUser._id;

        // 👉 (Optional) reward logic later
        // refUser.totalReferrals += 1;
        // await refUser.save();
      }
    }

    /* ---------------- CREATE USER ---------------- */

    const user = await User.create({
      userId,
      email: email.toLowerCase(),
      password: hash,
      name: name || "",
      fullName: fullName || "",
      referralCode: newReferralCode,
      referredBy, // 👈 store who referred
      balance: 0,
      minutes: 0,
      atc: 0,
      rate: 0,
      totalEarnings: 0,
      totalMinutes: 0,
      pushTokens: [],
      earlyAdopter: false, // now public
      role: "user",
    });

    /* ---------------- JWT ---------------- */

    if (!JWT_SECRET)
      throw new Error("JWT_SECRET missing");

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    /* ---------------- SAFE RESPONSE ---------------- */

    const userSafe = user.toObject();
    delete userSafe.password;

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: userSafe,
    });

  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

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
        message: "Email and password required"
      });
      

    // IMPORTANT: explicitly select password
    const user = await User.findOne({
      email: email.toLowerCase()
    }).select("+password");

    if (!user)
      return res.status(401).json({
        message: "Invalid email or password"
      });

    if (!user.password)
      return res.status(500).json({
        message: "User password missing (data integrity error)"
      });

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid)
      return res.status(401).json({
        message: "Invalid email or password"
      });

    if (!process.env.JWT_SECRET)
      throw new Error("JWT_SECRET missing");

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user
    });

  }
  catch (error: any) {

    console.error(
      "LOGIN CRITICAL ERROR:",
      error
    );

    return res.status(500).json({
      message: "Login failed",
      error: error.message
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