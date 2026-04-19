"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }: { children: any }) {
  const router = useRouter();

  const [status, setStatus] = useState<"checking" | "authorized">("checking");

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("adminToken")
        : null;

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    // 🔥 OPTIONAL: basic expiry check (no library)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (payload.exp * 1000 < Date.now()) {
        console.warn("⏰ Token expired");

        localStorage.removeItem("adminToken");
        router.replace("/admin/login");
        return;
      }
    } catch (err) {
      console.warn("❌ Invalid token");

      localStorage.removeItem("adminToken");
      router.replace("/admin/login");
      return;
    }

    setStatus("authorized");
  }, [router]);

  if (status !== "authorized") return null;

  return children;
}