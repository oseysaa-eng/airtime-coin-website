import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function getDeviceFingerprint() {
  const raw = [
    Device.brand,
    Device.modelName,
    Device.osName,
    Device.osVersion,
    Platform.OS,
    Application.androidId || Application.applicationId,
  ].join("|");

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    raw
  );

  return hash;
}
