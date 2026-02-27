import React, { createContext, ReactNode, useEffect, useState } from "react";
import API from "../api/api";

interface KYCContextType {
  kycStatus: "not_submitted" | "pending" | "verified" | "rejected";
  refreshKyc: () => Promise<void>;
}

export const KYCContext = createContext<KYCContextType>({
  kycStatus: "not_submitted",
  refreshKyc: async () => {},
});

export const KYCProvider = ({ children }: { children: ReactNode }) => {
  const [kycStatus, setKycStatus] = useState<
    "not_submitted" | "pending" | "verified" | "rejected"
  >("not_submitted");

  const refreshKyc = async () => {
    try {
      const res = await API.get("/api/kyc/status");
      setKycStatus(res.data.kycStatus);
    } catch (err) {
      console.log("KYC status error:", err);
    }
  };

  useEffect(() => {
    refreshKyc();
  }, []);

  return (
    <KYCContext.Provider value={{ kycStatus, refreshKyc }}>
      {children}
    </KYCContext.Provider>
  );
};
