"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import IncidentBanner from "@/components/admin/IncidentBanner";
import adminApi from "@/lib/adminApi";
import { adminLogout } from "@/lib/adminAuth";
import { getAdminSocket } from "@/lib/adminSocket";

/* ======================================================
   NAVIGATION
====================================================== */

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "System", href: "/admin/system" },
  { label: "Users", href: "/admin/users" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Fraud", href: "/admin/fraud" },
  { label: "Devices", href: "/admin/devices" },
  { label: "Audit Logs", href: "/admin/audit" },
  { label: "Invites", href: "/admin/invites" }
];

/* ======================================================
   DEVICE STATUS BADGE
====================================================== */

function DeviceBadge({ summary }: { summary: any }) {
  if (!summary) return null;

  if (summary.blocked > 0) {
    return (
      <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
        {summary.blocked}
      </span>
    );
  }

  if (summary.flagged > 0) {
    return (
      <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
        {summary.flagged}
      </span>
    );
  }

  return (
    <span className="ml-auto bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
      ✓
    </span>
  );
}

/* ======================================================
   ADMIN LAYOUT
====================================================== */

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [settings, setSettings] = useState<any>(null);
  const [deviceSummary, setDeviceSummary] = useState<any>(null);

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [pathname, router]);

  /* ================= SYSTEM SETTINGS ================= */

  useEffect(() => {
    if (pathname === "/admin/login") return;

    adminApi
      .get("/system")
      .then(res => setSettings(res.data.settings))
      .catch(() => {});
  }, [pathname]);



  useEffect(() => {

  const socket = getAdminSocket();

  socket.on("device.flagged", () => {
    console.log("Device flagged");
  });

  socket.on("device.blocked", () => {
    console.log("Device blocked");
  });

  socket.on("device.trusted", () => {
    console.log("Device trusted");
  });

  return () => {
    socket.off("device.flagged");
    socket.off("device.blocked");
    socket.off("device.trusted");
  };

}, []);

  /* ================= DEVICE SNAPSHOT ================= */

  useEffect(() => {

  adminApi
    .get("/devices/summary")
    .then(res => setDeviceSummary(res.data))
    .catch(() => {});

}, []);

  /* ================= LOGIN PAGE ================= */

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#050505] text-white flex flex-col">
        {/* LOGO */}
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-wide">
            AirtimeCoin
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Admin Console
          </p>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition
                  ${
                    active
                      ? "bg-teal-600 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
              >
                <span>{item.label}</span>

                {(item.href === "/admin/devices" ||
                  item.href === "/admin/fraud") && (
                  <DeviceBadge summary={deviceSummary} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={adminLogout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            {NAV_ITEMS.find(n =>
              pathname.startsWith(n.href)
            )?.label || "Admin"}
          </h2>

          <IncidentBanner
            message={settings?.incidentMode?.message}
          />
        </header>

        {/* PAGE CONTENT */}
        <section className="p-6 flex-1 overflow-y-auto bg-[#f8fafc]">
          {children}
        </section>
      </main>
    </div>
  );
}