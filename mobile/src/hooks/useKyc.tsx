import { useEffect, useState } from "react";
import API from "../api/api";

export function useKyc() {
  const [kycStatus, setKycStatus] = useState<"not_submitted"|"pending"|"verified"|"rejected">("not_submitted");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/kyc/status");
      setKycStatus(res.data.kycStatus || "not_submitted");
    } catch (err) {
      console.warn("useKyc load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return { kycStatus, loading, reload: load };
}
