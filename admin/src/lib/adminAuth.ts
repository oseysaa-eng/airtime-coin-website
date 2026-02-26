export function requireAdmin() {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "/admin/login";
  }
}

export function adminLogout() {
  localStorage.removeItem("adminToken");
  window.location.href = "/admin/login";
}
