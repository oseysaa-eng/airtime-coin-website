import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  "https://atc-backend-cn4f.onrender.com";

const adminApi = axios.create({
  baseURL: `${API_URL}/api/admin`,
  timeout: 30000,
});

/* REQUEST INTERCEPTOR */
adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No admin token found");
    }
  }

  return config;
});

/* RESPONSE INTERCEPTOR */
adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    if (status === 401) {
      console.warn("❌ Unauthorized — clearing session");

      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken");

        // 🔥 prevent redirect loop
        if (!window.location.pathname.includes("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }
    }

    return Promise.reject(err);
  }
);

export default adminApi;