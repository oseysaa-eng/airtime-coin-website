"use client";

export default function DeviceTable({
  devices,
  trustDevice,
  flagDevice,
  blockDevice,
}: any) {

  if (!devices.length) {
    return (
      <div className="p-6 text-gray-500">
        No devices found
      </div>
    );
  }

  return (

    <div className="border rounded overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3 text-left">Device</th>
            <th>User</th>
            <th>Risk</th>
            <th>Status</th>
            <th>Last Seen</th>
            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {devices.map((device: any) => (

            <tr key={device._id} className="border-t">

              <td className="p-3">
                {device.deviceName || "Unknown"}
              </td>

              <td>
                {device.userId?.email || "-"}
              </td>

              <td>

                <span className={
                  device.riskScore > 70
                    ? "text-red-600 font-bold"
                    : device.riskScore > 40
                    ? "text-orange-500 font-bold"
                    : "text-green-600 font-bold"
                }>
                  {device.riskScore}
                </span>

              </td>

              <td>

                {device.blocked
                  ? "Blocked"
                  : device.flagged
                  ? "Flagged"
                  : device.trusted
                  ? "Trusted"
                  : "New"}

              </td>

              <td>
                {device.lastSeen
                  ? new Date(device.lastSeen).toLocaleString()
                  : "-"}
              </td>

              <td className="space-x-2">

                <button
                  onClick={() => trustDevice(device._id)}
                  className="px-2 py-1 bg-green-600 text-white rounded"
                >
                  Trust
                </button>

                <button
                  onClick={() => flagDevice(device._id)}
                  className="px-2 py-1 bg-orange-500 text-white rounded"
                >
                  Flag
                </button>

                <button
                  onClick={() => blockDevice(device._id)}
                  className="px-2 py-1 bg-red-600 text-white rounded"
                >
                  Block
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}