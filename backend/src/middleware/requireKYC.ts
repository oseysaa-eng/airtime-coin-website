// src/middleware/requireKYC.ts
import { NextFunction, Response } from "express";
import User from "../models/User";

export default async function requireKYC(req: any, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.kycStatus !== "verified") {
      return res.status(403).json({ message: "KYC required. Please complete verification." });
    }
    next();
  } catch (err) {
    console.error("requireKYC error", err);
    res.status(500).json({ message: "Server error" });
  }
}
