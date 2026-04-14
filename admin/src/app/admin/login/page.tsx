"use client";

import adminApi from "@/lib/adminApi";
import { connectAdminSocket } from "@/lib/adminSocket";
import { useRouter } from "next/navigation";
import { useState } from "react";

/* 🔥 SINGLE SOURCE OF TRUTH */
const TOKEN_KEY = "adminToken";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await adminApi.post("/auth", {
        email,
        password,
      });

      /* ================= SAVE TOKEN ================= */
      localStorage.setItem(TOKEN_KEY, res.data.token);

      /* ================= CONNECT SOCKET ================= */
      connectAdminSocket(); // 🔥 important

      /* ================= NAVIGATE ================= */
      router.replace("/admin/dashboard");

    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-96 p-6 border rounded-xl shadow-sm bg-white">
        <h1 className="text-xl font-bold mb-4 text-center">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3">
            {error}
          </p>
        )}

        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-4 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          disabled={loading}
          className="bg-black text-white w-full py-2 rounded disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}