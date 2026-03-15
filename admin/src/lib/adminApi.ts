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
    }

  }

  return config;

});

/* RESPONSE INTERCEPTOR */

adminApi.interceptors.response.use(
  (res) => res,

  (err) => {

    if (err.response?.status === 401) {

      if (typeof window !== "undefined") {

        localStorage.removeItem("adminToken");

        window.location.href = "/admin/login";

      }

    }

    return Promise.reject(err);

  }
);

export default adminApi;