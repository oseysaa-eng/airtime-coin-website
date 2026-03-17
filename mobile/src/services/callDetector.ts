import { NativeModules, NativeEventEmitter } from "react-native";

const { CallDetector } = NativeModules;
const emitter = new NativeEventEmitter(CallDetector);

export function startCallListener(onStart: any, onEnd: any) {

  emitter.addListener("CALL_STARTED", onStart);
  emitter.addListener("CALL_ENDED", onEnd);

  CallDetector.startListener();
}