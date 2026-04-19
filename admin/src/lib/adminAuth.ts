import { disconnectAdminSocket } from "@/lib/adminSocket";

export const adminLogout = () => {
  if (typeof window === "undefined") return;

  try {
    // 🔥 remove token
    localStorage.removeItem("adminToken");

    // 🔥 properly disconnect socket
    disconnectAdminSocket();

    // 🔥 safe redirect (no history)
    window.location.replace("/admin/login");

  } catch (err) {
    console.error("Logout error:", err);

    // fallback
    window.location.replace("/admin/login");
  }
};