import Cookies from "js-cookie";

export function adminLogout() {
  Cookies.remove("adminToken");
  window.location.href = "/login";
}
