import axios from "axios";

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/admin",
  timeout: 15000,
});

/* ======================================================
   REQUEST INTERCEPTOR
====================================================== */

adminApi.interceptors.request.use((config) => {

  if (typeof window !== "undefined") {

    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

  }

  return config;

});

/* ======================================================
   RESPONSE INTERCEPTOR
====================================================== */

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