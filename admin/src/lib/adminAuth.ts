export const adminLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("adminToken"); // ✅ correct storage

    // 🔥 optional: clear socket
    try {
      const socket = (window as any).__adminSocket;
      socket?.disconnect?.();
    } catch {}

    window.location.href = "/admin/login";
  }
};