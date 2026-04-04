import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const ACCESS_EXPIRES = "1d";
const REFRESH_EXPIRES = "30d";

/* =============================
   GENERATE REFERRAL CODE
============================= */
async function generateReferralCode(): Promise<string> {
  while (true) {
    const code =
      "ATC" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const exists = await User.findOne({ referralCode: code });
    if (!exists) return code;
  }
}

/* =============================
   GENERATE TOKENS
============================= */
function generateTokens(userId: string) {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });

  const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });

  return { accessToken, refreshToken };
}

/* =============================
   REGISTER
============================= */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, fullName, referralCode } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const existing = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existing) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hash = await bcrypt.hash(password, 12);

    const newReferralCode = await generateReferralCode();

    let referredBy = null;

    if (referralCode) {
      const refUser = await User.findOne({
        referralCode: referralCode.toUpperCase(),
      });

      if (refUser) {
        referredBy = refUser._id;
      }
    }

    const user = await User.create({
      userId: new mongoose.Types.ObjectId().toString(),
      email: email.toLowerCase(),
      password: hash,
      name: name || "",
      fullName: fullName || "",
      referralCode: newReferralCode,
      referredBy,
      balance: 0,
      minutes: 0,
      atc: 0,
      rate: 0,
      totalEarnings: 0,
      totalMinutes: 0,
      pushTokens: [],
      earlyAdopter: false,
      role: "user",
    });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

  

    const safeUser = {
      _id: user._id,
      email: user.email,
      name: user.name,
    };

    return res.status(201).json({
  message: "Registered successfully",
  token: accessToken, // keep frontend compatibility
  refreshToken,
  user: safeUser,
});

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* =============================
   LOGIN
============================= */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, fingerprint } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    /* 🔐 DEVICE TRACKING */
    if (fingerprint) {
      user.lastDevice = fingerprint;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    const safeUser = {
      _id: user._id,
      email: user.email,
      name: user.name,
    };
    return res.status(200).json({
  message: "Login successful",
  token: accessToken,
  refreshToken,
  user: safeUser,
});


  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

/* =============================
   REFRESH TOKEN (🔥 REQUIRED)
============================= */
export const refreshAuthToken = async (req: Request, res: Response) => {
  try {
    const refresh = req.body.refreshToken;

    if (!refresh) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded: any = jwt.verify(refresh, JWT_REFRESH_SECRET);

    // ✅ VERIFY USER STILL EXISTS
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // 🔁 ROTATE TOKENS (BEST PRACTICE)
    const { accessToken, refreshToken: newRefresh } = generateTokens(
      user._id.toString()
    );

    return res.json({
      token: accessToken,
      refreshToken: newRefresh, // 🔥 NEW refresh token
    });

  } catch (err) {
    return res.status(401).json({
      message: "Invalid refresh token",
    });
  }
};

/* =============================
   GET CURRENT USER
============================= */
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id)
  .select("-password")
  .lean();

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);

  } catch (error) {
    console.error("GET ME ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};