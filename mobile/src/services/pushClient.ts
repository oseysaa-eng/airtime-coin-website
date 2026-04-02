import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";
import API from "../api/api";

export async function registerForPushNotificationsAsync() {
  try {
    if (!Constants.isDevice) {
      console.warn("❌ Must use real device");
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Permission required");
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    console.log("📲 PUSH TOKEN:", token);

    await AsyncStorage.setItem("pushToken", token);

    await API.post("/api/push/register", { token });

    return token;

  } catch (err) {
    console.error("❌ Push setup error:", err);
    return null;
  }
}