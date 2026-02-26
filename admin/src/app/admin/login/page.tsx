"use client";

import adminApi from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TOKEN_KEY = process.env.NEXT_PUBLIC_ADMIN_TOKEN_KEY || "adminToken";


export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await adminApi.post("/auth", {
        email,
        password,
      });

      localStorage.setItem(TOKEN_KEY, res.data.token);
      router.replace("/admin/dashboard");
    } catch {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-96 p-6 border rounded">
        <h1 className="text-xl font-bold mb-4">Admin Login</h1>

        {error && <p className="text-red-500">{error}</p>}

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-4"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-black text-white w-full py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}