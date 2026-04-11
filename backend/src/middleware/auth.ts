import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

/* ================= TYPES ================= */

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/* ================= MIDDLEWARE ================= */

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    /* ❌ No token */
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    /* ❌ Missing secret (critical) */
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not set");
      return res.status(500).json({
        message: "Server misconfiguration",
      });
    }

    /* 🔓 VERIFY TOKEN */
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    /* ❌ Invalid structure */
    if (!decoded || !decoded.id) {
      return res.status(403).json({
        message: "Invalid token payload",
      });
    }

    /* ✅ Attach user */
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "user",
    };

    next();

  } catch (err: any) {
    console.error("❌ AUTH ERROR:", err.message);

    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};