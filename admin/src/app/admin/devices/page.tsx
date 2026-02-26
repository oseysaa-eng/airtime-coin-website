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

  /* ─────────────────────────────
     LOAD DEVICES
  ───────────────────────────── */
  const loadDevices = async () => {

    try {

      setLoading(true);

      const res = await adminApi.get("/devices", {
        params: {
          page,
          search,
          status
        }
      });

      setDevices(res.data?.devices || []);
      setPages(res.data?.pagination?.pages || 1);

    } catch (err) {

      console.error("Device load error:", err);

      setDevices([]);
      setPages(1);

    } finally {

      setLoading(false);

    }

  };

useEffect(() => {

  const socket = getAdminSocket();

  socket.on("device.flagged", loadDevices);
  socket.on("device.blocked", loadDevices);
  socket.on("device.trusted", loadDevices);

  return () => {

    socket.off("device.flagged", loadDevices);
    socket.off("device.blocked", loadDevices);
    socket.off("device.trusted", loadDevices);

  };

}, []);



  useEffect(() => {

    loadDevices();

  }, [page, search, status]);

  /* ─────────────────────────────
     DEVICE ACTIONS
  ───────────────────────────── */

  const trustDevice = async (id: string) => {

    await adminApi.post(`/devices/${id}/trust`);

    loadDevices();

  };

  const flagDevice = async (id: string) => {

    await adminApi.post(`/devices/${id}/flag`);

    loadDevices();

  };

  const blockDevice = async (id: string) => {

    if (!confirm("Block this device?")) return;

    await adminApi.post(`/devices/${id}/block`);

    loadDevices();

  };

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

      {/* DEVICE TABLE COMPONENT */}
      {loading ? (

        <p>Loading devices...</p>

      ) : (

        <DeviceTable
          devices={devices}
          trustDevice={trustDevice}
          flagDevice={flagDevice}
          blockDevice={blockDevice}
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