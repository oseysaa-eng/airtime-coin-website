"use client";

import { adminLogout } from "@/lib/adminAuth";

export default function AdminSidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <nav className="space-y-3">
        <a href="/admin/dashboard">Dashboard</a>
        <a href="/admin/users">Users</a>
        <a href="/admin/system">System</a>
        <a href="/admin/analytics" className="block py-2">
          📊 Analytics
        </a>

        <button
          onClick={adminLogout}
          className="mt-6 text-red-600 font-semibold"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}