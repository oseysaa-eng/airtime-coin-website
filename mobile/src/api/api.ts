import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError } from "axios";

const API = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL ||
    "https://atc-backend-cn4f.onrender.com",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Attach JWT automatically
 */
API.interceptors.request.use(
  async (config) => {
    try {

      const token = await AsyncStorage.getItem("userToken");

      console.log("TOKEN SENT:", token); // debug

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
 * Auto logout if token invalid
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