import { Response, NextFunction } from "express";
import crypto from "crypto";

export const trackDevice = (
  req: any,
  _res: Response,
  next: NextFunction
) => {
  try {

    /* ================= DEVICE ID ================= */

    let deviceId: string | null = null;

    const rawDeviceId =
      req.headers["x-device-id"];

    if (
      typeof rawDeviceId === "string" &&
      rawDeviceId.trim().length > 10
    ) {
      deviceId = rawDeviceId
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 128);
    }

    /* ================= IP ================= */

    let ipAddress = null;

    const forwarded =
      req.headers["x-forwarded-for"];

    if (typeof forwarded === "string") {
      ipAddress = forwarded
        .split(",")[0]
        .trim();
    } else {
      ipAddress =
        req.ip ||
        req.socket?.remoteAddress ||
        null;
    }

    /* ================= USER AGENT ================= */

    const userAgent =
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"].slice(0, 255)
        : "unknown";

    /* ================= FALLBACK ================= */

    /*
      ONLY use fallback if frontend
      failed to send x-device-id
    */

    if (!deviceId) {

      const fallbackRaw = [
        userAgent,
        ipAddress,
      ].join("|");

      deviceId = crypto
        .createHash("sha256")
        .update(fallbackRaw)
        .digest("hex");
    }

    /* ================= FINAL HASH ================= */

    const deviceHash = crypto
      .createHash("sha256")
      .update(deviceId)
      .digest("hex");

    /* ================= ATTACH ================= */

    req.device = {
      deviceId,
      deviceHash,
      ipAddress,
      userAgent,
    };

    next();

  } catch (err) {

    console.error(
      "Device tracking error:",
      err
    );

    req.device = {
      deviceId: null,
      deviceHash: null,
      ipAddress: null,
      userAgent: null,
    };

    next();
  }
};