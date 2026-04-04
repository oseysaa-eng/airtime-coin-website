import { useEffect } from "react";
import { onSocketEvent } from "../services/socket";
import { useAppStore } from "../store/appStore";

export const useAppSocket = () => {
  const setPinStatus = useAppStore(s => s.setPinStatus);
  const setKycStatus = useAppStore(s => s.setKycStatus);

  useEffect(() => {
    let cleanups: (() => void)[] = [];

    const init = async () => {
      // ✅ PIN updates
      const offPin = await onSocketEvent("pin:update", (payload) => {
        console.log("🔔 PIN Updated", payload);
        setPinStatus(payload.configured);
      });

      // ✅ KYC updates
      const offKyc = await onSocketEvent("kyc:update", (payload) => {
        console.log("🔔 KYC Update:", payload);
        setKycStatus(payload.status);
      });

      cleanups = [offPin, offKyc];
    };

    init();

    return () => {
      cleanups.forEach(fn => fn && fn());
    };
  }, []);
};