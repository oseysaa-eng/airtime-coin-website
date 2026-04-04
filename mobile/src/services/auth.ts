import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/api";

export const refreshAuthToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) throw new Error("No refresh token");

    const res = await API.post("/api/auth/refresh", {
      refreshToken,
    });

    const newToken = res.data.token;

    await AsyncStorage.setItem("userToken", newToken);

    return newToken;

  } catch (error) {
    console.log("❌ Refresh failed");

    await AsyncStorage.multiRemove(["userToken", "refreshToken", "userId"]);

    throw error;
  }
};