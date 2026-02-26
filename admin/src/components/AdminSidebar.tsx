"use client";

import { adminLogout } from "@/lib/logout";

export default function AdminSidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <nav className="space-y-3">
        <a href="/dashboard">Dashboard</a>
        <a href="/users">Users</a>
        <a href="/system">System</a>
        <a href="/analytics" className="block py-2">
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


