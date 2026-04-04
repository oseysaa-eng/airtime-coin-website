import { Request, Response, NextFunction } from "express";

export const trackDevice = (
  req: any,
  _res: Response,
  next: NextFunction
) => {
  try {
    // ✅ SAFE DEVICE ID (string only)
    const rawDeviceId = req.headers["x-device-id"];
    const deviceId =
      typeof rawDeviceId === "string" ? rawDeviceId : null;

    // ✅ REAL IP (works behind proxy like Render)
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      typeof forwarded === "string"
        ? forwarded.split(",")[0]
        : req.socket?.remoteAddress || null;

    // ✅ USER AGENT (device info)
    const userAgent = req.headers["user-agent"] || null;

    // ✅ ATTACH TO REQUEST
    req.device = {
      deviceId,
      ipAddress: ip,
      userAgent,
    };

    next();

  } catch (err) {
    // ❗ NEVER BLOCK REQUEST
    req.device = {
      deviceId: null,
      ipAddress: null,
      userAgent: null,
    };

    next();
  }
};