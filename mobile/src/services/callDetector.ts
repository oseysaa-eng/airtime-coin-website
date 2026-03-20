import { NativeModules, NativeEventEmitter } from "react-native";

const { CallDetector } = NativeModules;

export const initCallMining = (onStart:any, onEnd:any) => {

  if (!CallDetector) {
    console.warn("CallDetector not available (Expo Go?)");
    return;
  }

  const emitter = new NativeEventEmitter(CallDetector);

  emitter.addListener("CALL_STARTED", onStart);

  emitter.addListener("CALL_ENDED", (data) => {
    onEnd(data.duration);
  });

  CallDetector.start();
};