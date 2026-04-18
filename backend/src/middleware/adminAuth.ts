import jwt from "jsonwebtoken";
import Admin from "../models/Admin";

export default async function adminAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;

    /* ================= HEADER CHECK ================= */
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Admin token missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    /* ================= VERIFY ================= */
    const decoded: any = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET!
    );

    /* ================= TYPE CHECK ================= */
    if (decoded.type !== "super_admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    /* ================= ADMIN ================= */
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    /* ================= STATUS ================= */
    if (admin.isActive === false) {
      return res.status(403).json({ message: "Admin disabled" });
    }

    /* ================= TOKEN VERSION ================= */
    if (decoded.tokenVersion !== admin.tokenVersion) {
      return res.status(401).json({ message: "Session expired" });
    }

    /* ================= ATTACH ================= */
    req.admin = admin;

    next();

  } catch (err: any) {
    console.error("❌ ADMIN AUTH ERROR:", err.message);

    return res.status(401).json({
      message: "Invalid admin token",
    });
  }
}