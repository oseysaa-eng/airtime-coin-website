import { NativeModules, NativeEventEmitter } from "react-native";

const { CallDetector } = NativeModules;

const emitter = CallDetector
  ? new NativeEventEmitter(CallDetector)
  : null;

export const initCallMining = (onStart, onEnd) => {
  if (!CallDetector || !emitter) {
    console.warn("CallDetector native module not found");
    return () => {};
  }

  console.log("✅ Call Mining Initialized");

  const startSub = emitter.addListener("CALL_STARTED", () => {
    console.log("📞 CALL STARTED");

    CallDetector.startOverlay();
    onStart && onStart();
  });

  const endSub = emitter.addListener("CALL_ENDED", (data) => {
    console.log("📞 CALL ENDED");

    CallDetector.stopOverlay();
    onEnd && onEnd(data?.duration || 0);
  });

  CallDetector.start();

  // ✅ CLEANUP FUNCTION (VERY IMPORTANT)
  return () => {
    console.log("🧹 Cleaning Call Mining");

    startSub.remove();
    endSub.remove();

    if (CallDetector.stopListening) {
      CallDetector.stopListening();
    }

    CallDetector.stopOverlay();
  };
};