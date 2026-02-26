"use client";

import adminApi from "@/lib/adminApi";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDevicesPage() {
  const { id } = useParams();
  const [devices, setDevices] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    adminApi
      .get(`/devices/user/${id}`)
      .then((res) => {
        setDevices(res.data?.devices || []);
      });
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        User Devices
      </h1>

      {devices.map((d) => (
        <div key={d._id} className="border p-3 mb-2">
          {d.deviceName || "Unknown Device"}
        </div>
      ))}
    </div>
  );
}
