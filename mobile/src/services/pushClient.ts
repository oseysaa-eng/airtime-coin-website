// src/services/pushClient.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import API from "../api/api";

export async function registerForPushNotificationsAsync() {
  if (!Constants.isDevice) {
    console.warn("Must use physical device for push notifications");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    Alert.alert("Permission required", "Enable notifications in settings");
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync(); // works with Expo push tokens
  const token = tokenData.data;

  // store locally and send to backend
  await AsyncStorage.setItem("pushToken", token);

  try {
    await API.post("/api/push/register", { token });
  } catch (err) {
    console.error("Push token register failed", err);
  }

  return token;
}
