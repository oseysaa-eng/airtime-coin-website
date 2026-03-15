"use client";

import DeviceActions from "./DeviceActions";
import RiskBadge from "./RiskBadge";
import TrustBadge from "./TrustBadge";

export default function DeviceTable({
  devices,
  reload,
}: {
  devices: any[];
  reload: () => void;
}) {

  if (!devices || devices.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No devices found
      </div>
    );
  }

  return (

    <div className="border rounded overflow-hidden bg-white">

      <table className="w-full text-sm">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3 text-left">Device</th>
            <th className="text-left">User</th>
            <th>Risk</th>
            <th>Status</th>
            <th>Last Seen</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {devices.map((device: any) => {

            const deviceName =
              device.deviceName ||
              device.model ||
              "Unknown Device";

            const userEmail =
              device.userEmail ||
              device.userId?.email ||
              "-";

            const lastSeen =
              device.lastSeenAt
                ? new Date(device.lastSeenAt).toLocaleString()
                : "-";

            return (

              <tr
                key={device._id}
                className="border-t hover:bg-gray-50"
              >

                {/* DEVICE */}
                <td className="p-3">

                  <div className="font-medium">
                    {deviceName}
                  </div>

                  <div className="text-xs text-gray-500">
                    {device.platform}
                    {device.osVersion && (
                      <> • {device.osVersion}</>
                    )}
                  </div>

                </td>

                {/* USER */}
                <td>
                  {userEmail}
                </td>

                {/* RISK */}
                <td className="text-center">
                  <RiskBadge
                    score={device.riskScore ?? 0}
                  />
                </td>

                {/* STATUS */}
                <td className="text-center">
                  <TrustBadge
                    trusted={device.trusted}
                    flagged={device.flagged}
                    blocked={device.blocked}
                  />
                </td>

                {/* LAST SEEN */}
                <td className="text-gray-600">
                  {lastSeen}
                </td>

                {/* ACTIONS */}
                <td>
                  <DeviceActions
                    deviceId={device._id}
                    reload={reload}
                  />
                </td>

              </tr>

            );

          })}

        </tbody>

      </table>

    </div>

  );

}