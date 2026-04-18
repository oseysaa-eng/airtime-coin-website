"use client";

import adminApi from "@/lib/adminApi";
import {
  connectAdminSocket,
  disconnectAdminSocket,
} from "@/lib/adminSocket";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TOKEN_KEY = "adminToken";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (loading) return;

    /* ================= VALIDATION ================= */
    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      setLoading(true);
      setError("");

      const res = await adminApi.post("/auth", {
        email: normalizedEmail,
        password,
      });

      const token = res.data.token;

      if (!token) {
        throw new Error("No token received");
      }

      /* ================= RESET OLD SOCKET ================= */
      disconnectAdminSocket();

      /* ================= SAVE TOKEN ================= */
      localStorage.setItem(TOKEN_KEY, token);

      /* ================= CONNECT SOCKET (SAFE) ================= */
      const socket = connectAdminSocket(token); // 🔥 pass token directly

      if (!socket) {
        console.warn("⚠️ Socket delayed, retrying...");
        setTimeout(() => connectAdminSocket(token), 1000);
      }

      /* ================= NAVIGATE ================= */
      router.replace("/admin/dashboard");

    } catch (err: any) {
      console.log("❌ Login error:", err?.response?.data || err.message);

      setError(
        err?.response?.data?.message ||
        err.message ||
        "Login failed"
      );

      /* 🔒 CLEANUP */
      localStorage.removeItem(TOKEN_KEY);
      disconnectAdminSocket();

    } finally {
      setLoading(false);
    }
  };

  /* ================= ENTER KEY ================= */
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !loading) {
      login();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-96 p-6 border rounded-xl shadow-sm bg-white">
        <h1 className="text-xl font-bold mb-4 text-center">
          Admin Login
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        <input
          className="border p-2 w-full mb-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <input
          className="border p-2 w-full mb-4 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
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