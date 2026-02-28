import bcrypt from "bcryptjs";
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
   📝 REGISTER USER
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
        message: "Email and password are required",
      });
    }

    const settings =
      (await SystemSettings.findOne()) ||
      (await SystemSettings.create({}));

    /* =====================================================
       🧪 BETA SYSTEM
    ===================================================== */
    if (settings.beta?.active) {
      const userCount = await User.countDocuments();

      // 🛑 Beta user cap
      if (userCount >= settings.beta.maxUsers) {
        return res.status(403).json({
          message: "Beta is currently full.",
        });
      }

      // 🔐 Invite-only beta
      if (settings.beta.inviteOnly) {
        if (!inviteCode) {
          return res.status(403).json({
            message: "Invite code required for private beta",
          });
        }

        const codeDoc = await InviteCode.findOne({
          code: inviteCode,
          active: true,
          usedBy: null,
        });

        if (!codeDoc) {
          return res.status(403).json({
            message: "Invalid or already used invite code",
          });
        }

        // We'll assign after user is created
        (req as any).inviteDoc = codeDoc;
      }
    }

    /* =====================================================
       🔐 DUPLICATE CHECK
    ===================================================== */
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    /* =====================================================
       🔐 HASH PASSWORD
    ===================================================== */
    const hash = await bcrypt.hash(password, 10);

    const kycStart = new Date(
      process.env.KYC_START_DATE || Date.now()
    );
    const isEarly = new Date() < kycStart;

    /* =====================================================
       👤 CREATE USER
    ===================================================== */
    const user = await User.create({
      email,
      password: hash,
      name,
      fullName,

      profile: {
        avatar: "",
        phone: "",
        country: "",
      },

      earlyAdopter: isEarly,
      betaStatus: "approved",

      referral: {
        code: Math.random().toString(36).substring(2, 10),
        referredBy: referralCode || null,
        referredUsers: [],
        referralEarnings: 0,
      },

      donationTotal: 0,
      donorBadge: "none",

      totalEarnings: 0,
      totalMinutes: 0,
      chartData: [],
      kycStatus: "not_submitted",
    });

    /* =====================================================
       🎟 MARK INVITE CODE AS USED
    ===================================================== */
    if ((req as any).inviteDoc) {
      const invite = (req as any).inviteDoc;
      invite.usedBy = user._id;
      invite.usedAt = new Date();
      invite.active = false;
      await invite.save();
    }

    /* =====================================================
       🔗 REFERRAL PROCESSING
    ===================================================== */
    if (referralCode) {
      await getReferralCode(user._id.toString(), referralCode);
    }

    /* =====================================================
       🔐 ISSUE JWT
    ===================================================== */
    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: "Registered successfully",
      token,
      user,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   🔐 LOGIN USER
===================================================== */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, fingerprint } = req.body;

    if (!email || !password || !fingerprint) {
      return res.status(400).json({
        message: "Email, password and device fingerprint required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid login" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid login" });
    }

    const device = await verifyDevice({
      userId: user._id.toString(),
      fingerprint,
      deviceName: req.headers["user-agent"] as string,
      platform: req.headers["x-platform"] as string,
      ip: req.ip,
    });

    if (!device.allowed && device.reason !== "NEW_DEVICE") {
      return res.status(403).json({
        message: "Login blocked",
        reason: device.reason,
      });
    }

    if (!device.allowed && device.reason === "NEW_DEVICE") {
      await sendDeviceOTP({
        userId: user._id.toString(),
        email: user.email,
        fingerprint,
      });

      return res.status(403).json({
        message: "New device detected",
        reason: "OTP_REQUIRED",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user,
      newDevice: device.isNew,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =====================================================
   👤 GET CURRENT USER
===================================================== */
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const settings = await SystemSettings.findOne();

    res.json({
      email: user.email,
      name: user.name,
      fullName: user.fullName,
      earlyAdopter: user.earlyAdopter,

      totalMinutes: user.totalMinutes,
      balance: user.totalEarnings,

      kycStatus: user.kycStatus,
      profile: user.profile,
      donationTotal: user.donationTotal,
      donorBadge: user.donorBadge,
      referral: user.referral,

      beta: {
        status: user.betaStatus,
        conversionEnabled:
          !settings?.beta?.active || settings.beta.showConversion,
        withdrawalEnabled:
          !settings?.beta?.active || settings.beta.showWithdrawals,
      },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};