import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const TOKEN_KEY = "userToken";
const PIN_KEY = "withdrawalPin";

/* =============================
   TOKEN MANAGEMENT
============================= */

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.log("Save token error:", err);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.log("Get token error:", err);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.log("Clear token error:", err);
  }
};

/* =============================
   TOKEN REFRESH (SAFE)
============================= */

export const refreshAuthToken = async (): Promise<string> => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error("No token available");
    }

    const res = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const newToken = res.data.token;

    if (!newToken) {
      throw new Error("Invalid refresh response");
    }

    // ✅ AUTO SAVE NEW TOKEN
    await saveToken(newToken);

    return newToken;

  } catch (err: any) {
    console.log("🔒 Refresh token failed:", err?.response?.data || err.message);

    // ❗ important: clear bad token
    await clearToken();

    throw err;
  }
};

/* =============================
   WITHDRAWAL PIN
============================= */

export const saveWithdrawalPin = async (pin: string) => {
  try {
    await AsyncStorage.setItem(PIN_KEY, pin);
  } catch (err) {
    console.log("Save PIN error:", err);
  }
};

export const getWithdrawalPin = async () => {
  try {
    return await AsyncStorage.getItem(PIN_KEY);
  } catch (err) {
    console.log("Get PIN error:", err);
    return null;
  }
};

export const clearWithdrawalPin = async () => {
  try {
    await AsyncStorage.removeItem(PIN_KEY);
  } catch (err) {
    console.log("Clear PIN error:", err);
  }
};