import jwt from "jsonwebtoken";
import Admin from "../models/Admin";

export default async function adminAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Admin token missing" });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET!
    );

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid admin token" });
  }
}