import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";

/**
 * Production backend URL
 */
const API = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL ||
    "https://atc-backend-cn4f.onrender.com/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach auth token automatically
 */
API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.log("Token read error:", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Handle session expiration
 */
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      console.log("Session expired");

      await AsyncStorage.multiRemove([
        "userToken",
        "userId",
      ]);
    }

    return Promise.reject(error);
  }
);

export default API;