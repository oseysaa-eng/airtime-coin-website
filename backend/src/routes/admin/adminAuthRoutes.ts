import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin";
import { adminLoginLimiter } from "../../middleware/adminRateLimit";

const router = express.Router();

router.post("/", adminLoginLimiter, async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    if (!process.env.ADMIN_JWT_SECRET) {
      return res.status(500).json({
        message: "Server misconfigured",
      });
    }

    /* ================= FIND ADMIN ================= */

        const admin = await Admin.findOne({ email });

    if (admin?.lockUntil && admin.lockUntil > new Date()) {
      return res.status(403).json({
        message: "Account temporarily locked. Try later.",
      });
    }

    const fakeHash =
      "$2a$10$7a8f8d9f7a8f8d9f7a8f8uQy5Y1Qe7Y5Y1Qe7Y5Y1Qe7Y5Y1Qe7Y5";

    const hash = admin?.password || fakeHash;

    const match = await bcrypt.compare(password, hash);

    if (!admin || !match) {
      if (admin) {
        admin.failedAttempts = (admin.failedAttempts || 0) + 1;

        if (admin.failedAttempts >= 5) {
          admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
          admin.failedAttempts = 0;
        }

        await admin.save();
      }

      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /* ================= SUCCESS RESET ================= */
    admin.failedAttempts = 0;
    admin.lockUntil = undefined;
    await admin.save();

    /* ================= TOKEN ================= */
    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
        tokenVersion: admin.tokenVersion || 0,
      },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("🔐 Admin login:", {
      email: admin.email,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      time: new Date(),
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });

  } catch (err: any) {
    console.error("❌ ADMIN LOGIN ERROR:", err.message);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

export default router;