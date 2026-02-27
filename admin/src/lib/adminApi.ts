import axios from "axios";

const adminApi = axios.create({
  baseURL: "/api/admin",
  timeout: 15000,
});

/* ======================================================
   REQUEST INTERCEPTOR
====================================================== */

adminApi.interceptors.request.use(config => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("adminToken")
      : null;

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

/* ======================================================
   RESPONSE INTERCEPTOR
====================================================== */

adminApi.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");

      window.location.href = "/admin/login";
    }

    return Promise.reject(err);
  }
);

export default adminApi;