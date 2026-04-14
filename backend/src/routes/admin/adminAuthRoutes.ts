import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/Admin";

const router = express.Router();

/**
 * POST /api/admin/auth/login
 */
router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ================= VALIDATION ================= */
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    if (!process.env.ADMIN_JWT_SECRET) {
      console.error("❌ ADMIN_JWT_SECRET missing");
      return res.status(500).json({
        message: "Server misconfigured",
      });
    }

    /* ================= ADMIN ================= */
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /* 🔒 OPTIONAL: status check */
    if (admin.isActive === false) {
      return res.status(403).json({
        message: "Account disabled",
      });
    }

    /* ================= PASSWORD ================= */
    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /* ================= TOKEN ================= */
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: "admin", // 🔥 important
      },
      process.env.ADMIN_JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    /* ================= RESPONSE ================= */
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
      },
    });

    /* ================= LOG ================= */
    console.log("🔐 Admin login:", admin.email);

  } catch (err: any) {
    console.error("❌ ADMIN LOGIN ERROR:", err.message);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

export default router;