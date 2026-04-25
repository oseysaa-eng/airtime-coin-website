import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const trackDevice = (
  req: any,
  _res: Response,
  next: NextFunction
) => {
  try {
    /* ================= DEVICE ID ================= */

    let deviceId: string | null = null;

    const rawDeviceId = req.headers["x-device-id"];

    if (typeof rawDeviceId === "string") {
      // 🔒 sanitize (alphanumeric only)
      deviceId = rawDeviceId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
    }

    /* ================= IP ADDRESS ================= */

    let ip: string | null = null;

    const forwarded = req.headers["x-forwarded-for"];

    if (typeof forwarded === "string") {
      ip = forwarded.split(",")[0].trim();
    } else {
      ip =
        req.ip ||
        req.socket?.remoteAddress ||
        null;
    }

    /* ================= USER AGENT ================= */

    const userAgent =
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"].slice(0, 200)
        : null;

    /* ================= FALLBACK FINGERPRINT ================= */

    if (!deviceId) {
      const fingerprintRaw = `${ip}-${userAgent}`;

      deviceId = crypto
        .createHash("sha256")
        .update(fingerprintRaw)
        .digest("hex")
        .slice(0, 32);
    }

    /* ================= HASH DEVICE (PRIVACY SAFE) ================= */

    const deviceHash = crypto
      .createHash("sha256")
      .update(deviceId)
      .digest("hex");

    /* ================= ATTACH ================= */

    req.device = {
      deviceId,        // cleaned ID
      deviceHash,      // 🔥 use this in DB
      ipAddress: ip,
      userAgent,
    };

    next();

  } catch (err) {
    console.error("Device tracking error:", err);

    req.device = {
      deviceId: null,
      deviceHash: null,
      ipAddress: null,
      userAgent: null,
    };

    next();
  }
};