import geoip from "geoip-lite";

export const getGeo = (ip: string) => {
  const geo = geoip.lookup(ip);
  return {
    country: geo?.country || "UNKNOWN",
    city: geo?.city || "UNKNOWN",
  };
};
