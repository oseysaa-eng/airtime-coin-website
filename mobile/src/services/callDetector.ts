import { NativeModules, NativeEventEmitter } from "react-native";

const { CallDetector } = NativeModules;
const emitter = new NativeEventEmitter(CallDetector);

export const initCallMining = (onStart, onEnd) => {

  emitter.removeAllListeners("CALL_STARTED");
  emitter.removeAllListeners("CALL_ENDED");

  emitter.addListener("CALL_STARTED", () => {
    console.log("📞 CALL STARTED");

    CallDetector.startOverlay(); // ✅ SAFE NOW

    onStart();
  });

  emitter.addListener("CALL_ENDED", (data) => {
    console.log("📞 CALL ENDED");

    CallDetector.stopOverlay(); // ✅ STOP SERVICE

    onEnd(data.duration);
  });

  CallDetector.start();
};