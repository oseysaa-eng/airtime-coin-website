// src/controllers/authController.ts

import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User from "../models/User";
import InviteCode from "../models/InviteCode";
import SystemSettings from "../models/SystemSettings";
import { getReferralCode } from "./referralController";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = "30d";

/* =====================================================
   REGISTER USER
===================================================== */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      fullName,
      referralCode,
      inviteCode,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    /* =============================
       BETA VALIDATION
    ============================= */
    if (settings.beta?.active && settings.beta.inviteOnly) {
      if (!inviteCode) {
        return res.status(403).json({
          message: "Invite code required",
        });
      }

      const code = await InviteCode.findOne({
        code: inviteCode,
        active: true,
      });

      if (!code) {
        return res.status(403).json({
          message: "Invalid invite code",
        });
      }

      (req as any).inviteDoc = code;
    }

    /* =============================
       DUPLICATE CHECK
    ============================= */
    const exists = await User.findOne({
      email: email.toLowerCase(),
    });

    if (exists) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    /* =============================
       HASH PASSWORD
    ============================= */
    const hash = await bcrypt.hash(password, 12);

    /* =============================
       CREATE USER
    ============================= */
    const user = await User.create({
      email: email.toLowerCase(),
      password: hash,

      name,
      fullName,

      userId: new mongoose.Types.ObjectId().toString(),

      minutes: 0,
      atc: 0,
      rate: 0,

      pushTokens: [],

      referralCode: Math.random()
        .toString(36)
        .substring(2, 10),

      referredBy: referralCode || "",

      earlyAdopter: true,
      role: "user",
    });

    /* =============================
       MARK INVITE USED
    ============================= */
    if ((req as any).inviteDoc) {
      const invite = (req as any).inviteDoc;

      invite.usedBy = user._id;
      invite.active = false;

      await invite.save();
    }

    /* =============================
       REFERRAL PROCESS
    ============================= */
    if (referralCode) {
      await getReferralCode(
        user._id.toString(),
        referralCode
      );
    }

    /* =============================
       CREATE TOKEN
    ============================= */
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

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* =====================================================
   LOGIN USER
===================================================== */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid login",
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(401).json({
        message: "Invalid login",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
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

/* =====================================================
   GET CURRENT USER
===================================================== */
export const getMe = async (
  req: any,
  res: Response
) => {
  try {
    const user = await User.findById(
      req.user.id
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};