import axios from "axios";

const adminApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_ADMIN_API_URL + "/api/admin",
});

adminApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default adminApi;