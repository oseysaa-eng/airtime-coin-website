import * as Device from "expo-device";

export const checkEmulator = () => {

  if (!Device.isDevice) {

    throw new Error("Emulator detected");

  }

};