import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  "https://atc-backend-cn4f.onrender.com";

const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  timeout: 30000,
});

/* ============================================
   STATE CONTROL (🔥 prevent duplicate redirects)
============================================ */
let isRedirecting = false;

/* ============================================
   REQUEST INTERCEPTOR
============================================ */
adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/* ============================================
   RESPONSE INTERCEPTOR
============================================ */
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    /* 🔥 NETWORK ERROR */
    if (!err.response) {
      console.error("🌐 Network error or server down");
      return Promise.reject(err);
    }

    /* 🔒 UNAUTHORIZED */
    if (status === 401 && typeof window !== "undefined") {
      if (!isRedirecting) {
        isRedirecting = true;

        console.warn("❌ Unauthorized — clearing session");

        localStorage.removeItem("adminToken");

        if (!window.location.pathname.includes("/admin/login")) {
          window.location.replace("/admin/login"); // ✅ better than href
        }
      }
    }

    return Promise.reject(err);
  }
);

export default adminApi;