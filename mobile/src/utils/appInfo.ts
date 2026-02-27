import * as Application from "expo-application";
import * as Device from "expo-device";

export const getAppInfo = async () => {
  return {
    appName: Application.applicationName,
    version: Application.nativeApplicationVersion,
    build: Application.nativeBuildVersion,
    packageName:
      Application.applicationId || "unknown",
    deviceName: Device.deviceName,
    osName: Device.osName,
    osVersion: Device.osVersion,
    model: Device.modelName,
  };
};