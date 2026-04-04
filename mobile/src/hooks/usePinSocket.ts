import { useEffect } from "react";
import { onSocketEvent } from "../services/socket";

export const usePinSocket = (onPinUpdate: (payload: any) => void) => {
  useEffect(() => {
    let cleanups: (() => void)[] = [];

    const init = async () => {
      // ✅ PIN update
      const offPin = await onSocketEvent("pin:update", (payload) => {
        console.log("🔔 PIN Updated:", payload);
        onPinUpdate(payload);
      });

      // ✅ Withdraw update (optional)
      const offWithdraw = await onSocketEvent("withdraw:update", (payload) => {
        console.log("💸 Withdraw update:", payload);
      });

      cleanups = [offPin, offWithdraw];
    };

    init();

    return () => {
      cleanups.forEach(fn => fn && fn());
    };
  }, []);
};