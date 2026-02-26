"use client";

import adminApi from "@/lib/adminApi";

export default function DeviceActions({
  deviceId,
  reload,
}: {
  deviceId: string;
  reload: () => void;
}) {
  const trust = async () => {
    await adminApi.post(`/devices/${deviceId}/trust`);
    reload();
  };

  const flag = async () => {
    await adminApi.post(`/devices/${deviceId}/flag`);
    reload();
  };

  const block = async () => {
    await adminApi.post(`/devices/${deviceId}/block`);
    reload();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={trust}
        className="px-2 py-1 text-xs bg-green-600 text-white rounded"
      >
        Trust
      </button>

      <button
        onClick={flag}
        className="px-2 py-1 text-xs bg-orange-500 text-white rounded"
      >
        Flag
      </button>

      <button
        onClick={block}
        className="px-2 py-1 text-xs bg-red-600 text-white rounded"
      >
        Block
      </button>
    </div>
  );
}