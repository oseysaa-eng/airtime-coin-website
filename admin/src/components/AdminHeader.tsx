
"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  const adminLogout = () => {
    // Remove token
    document.cookie =
      "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // Redirect to login
    router.push("/login");
  };

  return (
    <button
      onClick={adminLogout}
      className="text-sm text-red-600 hover:underline"
    >
      Logout
    </button>
  );
}
