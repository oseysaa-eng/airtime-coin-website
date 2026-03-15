import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import * as Device from "expo-device";
import { Platform } from "react-native";

export async function getDeviceFingerprint() {

  const androidId =
    Application.androidId ||
    Application.getAndroidId?.() ||
    "unknown";

  const raw = [
    androidId,
    Device.modelId || Device.modelName,
    Device.osVersion,
    Platform.OS,
    Application.nativeApplicationVersion
  ].join("|");

  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    raw
  );

  return hash;
}