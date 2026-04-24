import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

/* =============================
   ENV VALIDATION
============================= */
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets not configured");
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_EXPIRES = "15m";
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
function generateTokens(user: any) {
  const payload = {
    id: user._id.toString(),
    role: user.role || "user",
  };

  const accessToken = jwt.sign(payload, JWT_SECRET!, {
    expiresIn: ACCESS_EXPIRES,
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET!, {
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
      if (refUser) referredBy = refUser._id;
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password: hash,
      name: name || "",
      fullName: fullName || "",
      referralCode: newReferralCode,
      referredBy,
    });
    const { accessToken, refreshToken } = generateTokens(user);

    // ✅ SAVE REFRESH TOKEN (multi-device)
    user.refreshTokens = [...(user.refreshTokens || []), refreshToken];
    await user.save();

    return res.status(201).json({
      message: "Registered successfully",
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
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
    }).select("+password +refreshTokens");

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

    const { accessToken, refreshToken } = generateTokens(user);

    /* 🔐 DEVICE TRACKING */
    if (fingerprint) {
      user.lastDevice = fingerprint;
    }

    user.lastLoginAt = new Date();

    user.lastIP = req.ip;
user.lastUserAgent = req.headers["user-agent"];

    // ✅ ADD refresh token (multi-device)
    user.refreshTokens = [
  ...(user.refreshTokens || []).slice(-4),
  refreshToken,
];

    await user.save();

    return res.status(200).json({
      message: "Login successful",
      token: accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Login failed",
    });
  }
};

/* =============================
   REFRESH TOKEN
============================= */
export const refreshAuthToken = async (req: Request, res: Response) => {
  try {
    const refresh = req.body.refreshToken;

    if (!refresh) {
      return res.status(401).json({ message: "NO_REFRESH_TOKEN" });
    }

    let decoded: any;

    try {
      decoded = jwt.verify(refresh, JWT_REFRESH_SECRET!);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "REFRESH_EXPIRED" });
      }
      return res.status(401).json({ message: "INVALID_REFRESH" });
    }

    const user = await User.findById(decoded.id).select("+refreshTokens");

    if (!user) {
      return res.status(401).json({ message: "USER_NOT_FOUND" });
    }

    // ✅ ensure token exists
    if (!user.refreshTokens.includes(refresh)) {
      return res.status(403).json({ message: "SESSION_INVALID" });
    }

    // 🔁 rotate tokens
    const { accessToken, refreshToken: newRefresh } = generateTokens(user);

    user.refreshTokens = [
      ...user.refreshTokens.filter((t) => t !== refresh).slice(-4),
      newRefresh,
    ];

    await user.save();

    return res.json({
      token: accessToken,
      refreshToken: newRefresh,
    });

  } catch (err) {
    console.error("REFRESH ERROR:", err);
    return res.status(500).json({
      message: "REFRESH_FAILED",
    });
  }
};


/* =============================
   LOGOUT 
============================= */
export const logoutUser = async (req: any, res: Response) => {
  try {
    const refresh = req.body.refreshToken;

    if (!refresh) {
      return res.status(400).json({ message: "No token provided" });
    }

    const user = await User.findById(req.user.id).select("+refreshTokens");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.refreshTokens = user.refreshTokens.filter(t => t !== refresh);
    await user.save();

    return res.json({ message: "Logged out successfully" });

  } catch (err) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

/* =============================
   GET CURRENT USER
============================= */
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -refreshTokens")
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