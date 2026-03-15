"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";
import DeviceTable from "./components/DeviceTable";
import { getAdminSocket } from "@/lib/adminSocket";

export default function DevicesPage() {

  const [devices, setDevices] = useState<any[]>([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ─────────────────────────────
     LOAD DEVICES
  ───────────────────────────── */

  const loadDevices = async () => {

    try {

      setLoading(true);
      setError(null);

      const res = await adminApi.get("/devices", {
        params: {
          page,
          search,
          status
        }
      });

      setDevices(res.data?.devices || []);
      setPages(res.data?.pagination?.pages || 1);

    } catch (err: any) {

      console.error("Device load error:", err);

      setError("Failed to load devices");
      setDevices([]);
      setPages(1);

    } finally {

      setLoading(false);

    }

  };

  /* ─────────────────────────────
     SOCKET EVENTS
  ───────────────────────────── */

  useEffect(() => {

    const socket = getAdminSocket();

    const refresh = () => loadDevices();

    socket.on("device.flagged", refresh);
    socket.on("device.blocked", refresh);
    socket.on("device.trusted", refresh);

    return () => {

      socket.off("device.flagged", refresh);
      socket.off("device.blocked", refresh);
      socket.off("device.trusted", refresh);

    };

  }, []);

  /* ─────────────────────────────
     INITIAL LOAD
  ───────────────────────────── */

  useEffect(() => {
    loadDevices();
  }, [page, search, status]);

  /* ───────────────────────────── */

  return (

    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Device Management
      </h1>

      {/* SEARCH + FILTER */}

      <div className="flex gap-3">

        <input
          placeholder="Search device..."
          className="border px-3 py-2 rounded w-64"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <select
          className="border px-3 py-2 rounded"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All</option>
          <option value="trusted">Trusted</option>
          <option value="flagged">Flagged</option>
          <option value="blocked">Blocked</option>
        </select>

      </div>

      {/* TABLE */}

      {loading && (
        <p>Loading devices...</p>
      )}

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      {!loading && !error && (
        <DeviceTable
          devices={devices}
          reload={loadDevices}
        />
      )}

      {/* PAGINATION */}

      <div className="flex gap-2">

        {[...Array(pages)].map((_, i) => (

          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1
                ? "bg-black text-white"
                : ""
            }`}
          >
            {i + 1}
          </button>

        ))}

      </div>

    </div>

  );

}