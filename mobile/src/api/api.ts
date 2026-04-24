import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshAuthToken } from "../services/auth";
import { disconnectSocket, connectSocket } from "../services/socket";

const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =============================
   REQUEST INTERCEPTOR
============================= */
API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("userToken");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =============================
   RESPONSE INTERCEPTOR
============================= */

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const token = await AsyncStorage.getItem("userToken");
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!token || !refreshToken) {
      return Promise.reject(error);
    }

    // ✅ ONLY refresh on expired token
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(API(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAuthToken();

        if (!newToken) throw new Error("Refresh failed");

        processQueue(null, newToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // 🔌 reconnect socket safely
        disconnectSocket();
        await connectSocket();

        return API(originalRequest);

      } catch (err) {
        processQueue(err, null);

        await AsyncStorage.multiRemove([
          "userToken",
          "refreshToken",
          "userId",
        ]);

        disconnectSocket();

        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;