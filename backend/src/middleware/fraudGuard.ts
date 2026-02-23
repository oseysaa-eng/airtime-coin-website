// middleware/fraudGuard.ts
import geoip from "geoip-lite";

export default function fraudGuard(req, res, next) {
  const ip = req.ip;
  const geo = geoip.lookup(ip);

  if (!geo || geo.country !== "GH") {
    return res.status(403).json({ message: "Region restricted" });
  }

  next();
}
