import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onSocketEvent } from "../services/socket";

export const useKycSocket = () => {
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const init = async () => {
      cleanup = await onSocketEvent("kyc:update", async (payload) => {
        console.log("📡 REAL-TIME KYC UPDATE:", payload);

        // ✅ Store locally
        if (payload?.status) {
          await AsyncStorage.setItem("kycStatus", payload.status);
        }
      });
    };

    init();

    return () => {
      cleanup && cleanup();
    };
  }, []);
};