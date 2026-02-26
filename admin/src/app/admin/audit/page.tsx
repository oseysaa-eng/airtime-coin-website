"use client";

import adminApi from "@/lib/adminApi";
import clsx from "clsx";
import { useEffect, useState } from "react";

type Log = {
  _id: string;
  action: string;
  adminId?: { email: string };
  targetUserId?: { email: string };
  meta?: any;
  createdAt: string;
};

export default function AuditPage() {

  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ─────────────────────────────
     LOAD AUDIT LOGS
  ───────────────────────────── */

  const loadLogs = async () => {

  try {

    const res = await adminApi.get("/audit");

    setLogs(res.data.logs || []);

  } catch (err) {

    console.error(err);

    setLogs([]);

  } finally {

    setLoading(false);

  }

};

  useEffect(() => {

    loadLogs();

  }, []);



  /* ───────────────────────────── */

  if (loading) {

    return (
      <p className="p-6 text-sm text-gray-500">
        Loading audit logs…
      </p>
    );

  }

  return (

    <div className="space-y-6">

      {/* HEADER */}
      <div>

        <h1 className="text-2xl font-bold">
          Audit Logs
        </h1>

        <p className="text-sm text-gray-500">
          System & admin activity history
        </p>

      </div>

      {/* ERROR */}
      {error && (

        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>

      )}

      {/* EMPTY */}
      {!error && logs.length === 0 && (

        <div className="bg-white p-6 rounded border text-sm text-gray-500">

          No audit activity recorded yet.

        </div>

      )}

      {/* LOG LIST */}
      <div className="space-y-3">

        {logs.map((log) => (

          <div
            key={log._id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >

            {/* HEADER */}
            <div className="flex items-center justify-between">

              <span
                className={clsx(
                  "px-2 py-1 rounded text-xs font-medium",
                  actionColor(log.action)
                )}
              >
                {log.action}
              </span>

              <span className="text-xs text-gray-500">

                {new Date(log.createdAt).toLocaleString()}

              </span>

            </div>

            {/* DETAILS */}
            <div className="mt-2 text-sm space-y-1">

              <div>

                <strong>Admin:</strong>{" "}

                {log.adminId?.email || "System"}

              </div>

              {log.targetUserId && (

                <div>

                  <strong>User:</strong>{" "}

                  {log.targetUserId.email}

                </div>

              )}

            </div>

            {/* META */}
            {log.meta && (

              <pre className="mt-3 text-xs bg-gray-100 p-3 rounded overflow-auto">

                {JSON.stringify(log.meta, null, 2)}

              </pre>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}

/* ─────────────────────────────
   ACTION COLOR HELPER
──────────────────────────── */

function actionColor(action: string) {

  if (!action) return "bg-gray-100 text-gray-700";

  if (action.includes("BLOCK"))
    return "bg-red-100 text-red-700";

  if (action.includes("TRUST"))
    return "bg-yellow-100 text-yellow-700";

  if (action.includes("LOGIN"))
    return "bg-blue-100 text-blue-700";

  if (action.includes("SYSTEM"))
    return "bg-purple-100 text-purple-700";

  if (action.includes("UPDATE"))
    return "bg-green-100 text-green-700";

  return "bg-gray-100 text-gray-700";

}