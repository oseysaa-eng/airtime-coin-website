
import { NativeModules, NativeEventEmitter } from "react-native";

const { CallDetector } = NativeModules;

export function initCallMining(onStart, onEnd) {
  if (!CallDetector) {
    console.warn("CallDetector not available — use dev build");
    return;
  }

  const emitter = new NativeEventEmitter(CallDetector);

  CallDetector.start();

  emitter.addListener("CALL_STARTED", () => {
    console.log("📞 CALL STARTED");
    onStart();
  });

  emitter.addListener("CALL_ENDED", (data) => {
    console.log("📴 CALL ENDED", data);
    onEnd(data.duration);
  });
}