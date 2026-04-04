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

    // ✅ if no session → skip
    if (!token || !refreshToken) {
      return Promise.reject(error);
    }

    // 🔥 HANDLE 401
    if (error.response?.status === 401 && !originalRequest._retry) {

      // 🧠 QUEUE REQUESTS DURING REFRESH
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
        // 🔄 REFRESH TOKEN
        const newToken = await refreshAuthToken();

        if (!newToken) throw new Error("No token returned");

        // ✅ SAVE TOKEN
        await AsyncStorage.setItem("userToken", newToken);

        // 🔌 RECONNECT SOCKET WITH NEW TOKEN
        disconnectSocket();
        await connectSocket();

        // ✅ RELEASE QUEUE
        processQueue(null, newToken);

        // 🔁 RETRY ORIGINAL REQUEST
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return API(originalRequest);

      } catch (err) {
        console.log("❌ Refresh failed");

        processQueue(err, null);

        // 🔒 FULL LOGOUT CLEANUP
        await AsyncStorage.multiRemove([
          "userToken",
          "userId",
          "refreshToken",
        ]);

        disconnectSocket();

        console.log("🔒 Session expired → logout");

        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;