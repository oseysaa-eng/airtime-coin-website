type FraudOverview = {
  flaggedCalls: number;
  blockedDevices: number;
  suspiciousUsers: number;
  totalIncidents: number;
};

export default function FraudKPI({
  data,
}: {
  data?: FraudOverview;
}) {
  const safe = {
    flaggedCalls: data?.flaggedCalls ?? 0,
    blockedDevices: data?.blockedDevices ?? 0,
    suspiciousUsers: data?.suspiciousUsers ?? 0,
    totalIncidents: data?.totalIncidents ?? 0,
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="card">
        <div className="card-title">Flagged Calls</div>
        <div className="card-value">
          {safe.flaggedCalls}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Blocked Devices</div>
        <div className="card-value text-red-600">
          {safe.blockedDevices}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Suspicious Users</div>
        <div className="card-value text-orange-500">
          {safe.suspiciousUsers}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Total Incidents</div>
        <div className="card-value">
          {safe.totalIncidents}
        </div>
      </div>
    </div>
  );
}