import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";

/**
 * Base API instance
 * Uses production domain for beta & release
 */
const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://atc-backend-cn4f.onrender.com",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach auth token
 */
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Handle auth errors
 */
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      console.log("🔐 Session expired — clearing auth");

      await AsyncStorage.multiRemove([
        "userToken",
        "userId",
      ]);
    }

    return Promise.reject(error);
  }
);

export default API;