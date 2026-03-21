import * as Device from "expo-device";

export const checkEmulator = () => {
  const isEmulator = !Device.isDevice;

  // Allow emulator in development
  if (isEmulator && __DEV__) {
    console.log("⚠️ Emulator detected (allowed for development)");
    return false;
  }

  // Block emulator in production
  if (isEmulator && !__DEV__) {
    throw new Error("Emulator detected");
  }

  return true;
};