"use client";

import DeviceActions from "./DeviceActions";
import RiskBadge from "./RiskBadge";
import TrustBadge from "./TrustBadge";

export default function DeviceRow({
  device,
  reload,
}: {
  device: any;
  reload: () => void;
}) {
  return (
    <tr className="border-t">
      <td className="p-3">
        <div className="font-medium">
          {device.deviceName || "Unknown"}
        </div>
        <div className="text-xs text-gray-500">
          {device.platform}
        </div>
      </td>

      <td>
        <TrustBadge
          trusted={device.trusted}
          flagged={device.flagged}
          blocked={device.blocked}
        />
      </td>

      <td>
        <RiskBadge score={device.riskScore ?? 0} />
      </td>

      <td>
        {device.lastSeen
          ? new Date(device.lastSeen).toLocaleString()
          : "—"}
      </td>

      <td>
        <DeviceActions
          deviceId={device._id}
          reload={reload}
        />
      </td>
    </tr>
  );
}