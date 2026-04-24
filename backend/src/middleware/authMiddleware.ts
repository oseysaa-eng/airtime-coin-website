import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export default async function authMiddleware(
  req: any,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "NO_TOKEN" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "USER_NOT_FOUND" });
    }

    // 🚫 PAUSE CHECK
    if (user.pausedUntil && user.pausedUntil > new Date()) {
      return res.status(403).json({
        message: "ACCOUNT_PAUSED",
        pausedUntil: user.pausedUntil,
        reason: user.pauseReason,
      });
    }

    req.user = { id: user._id };
    next();

  } catch (err: any) {

    // ✅ KEY FIX
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "TOKEN_EXPIRED",
      });
    }

    console.error("JWT VERIFY FAILED:", err);

    return res.status(401).json({
      message: "INVALID_TOKEN",
    });
  }
}