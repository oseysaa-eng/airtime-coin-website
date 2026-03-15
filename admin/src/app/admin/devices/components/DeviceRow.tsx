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
  const deviceName =
    device.deviceName ||
    device.model ||
    "Unknown Device";

  const platform =
    device.platform ||
    device.os ||
    "Unknown OS";

  const lastSeen = device.lastSeenAt
    ? new Date(device.lastSeenAt).toLocaleString()
    : "—";

  return (
    <tr className="border-t hover:bg-gray-50">

      {/* DEVICE INFO */}
      <td className="p-3">
        <div className="font-medium">
          {deviceName}
        </div>

        <div className="text-xs text-gray-500">
          {platform}
          {device.osVersion && (
            <> • {device.osVersion}</>
          )}
        </div>
      </td>

      {/* TRUST STATUS */}
      <td>
        <TrustBadge
          trusted={device.trusted}
          flagged={device.flagged}
          blocked={device.blocked}
        />
      </td>

      {/* RISK SCORE */}
      <td>
        <RiskBadge score={device.riskScore ?? 0} />
      </td>

      {/* LAST SEEN */}
      <td className="text-sm text-gray-600">
        {lastSeen}
      </td>

      {/* ACTIONS */}
      <td>
        {device._id && (
          <DeviceActions
            deviceId={device._id}
            reload={reload}
          />
        )}
      </td>

    </tr>
  );
}