"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }: { children: any }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login"); // ✅ correct path
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) return null; // 🔥 prevents flashing UI

  return children;
}