import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function getDeviceFingerprint() {

  const androidId =
    Application.androidId ||
    "unknown";

  const raw = [
    androidId,
    Device.brand,
    Device.modelName,
    Device.osVersion,
    Platform.OS,
  ].join("|");

  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    raw
  );
}