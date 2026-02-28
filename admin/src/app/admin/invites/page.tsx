"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/adminApi";

export default function InviteCodesPage() {

  const [codes, setCodes] = useState<any[]>([]);
  const [newCode, setNewCode] = useState("");

  const load = async () => {

    const res = await adminApi.get("/invites");

    setCodes(res.data.codes);

  };

  const create = async () => {

    await adminApi.post("/invites", {
      code: newCode
    });

    setNewCode("");

    load();

  };

  const disable = async (id: string) => {

    await adminApi.post(`/invites/${id}/disable`);

    load();

  };

  useEffect(() => {

    load();

  }, []);

  return (

    <div className="space-y-6">

      <h1 className="text-xl font-bold">
        Invite Codes
      </h1>

      <div className="flex gap-2">

        <input
          value={newCode}
          onChange={e => setNewCode(e.target.value)}
          placeholder="Enter invite code"
          className="border p-2 rounded"
        />

<button
  onClick={async () => {

    const res = await adminApi.post(
      "/invites/generate-bulk",
      { count: 30 }
    );

    alert(res.data.message);

    load();

  }}
  className="bg-purple-600 text-white px-4 py-2 rounded"
>
  Generate 30 Beta Invites
</button>

      </div>

      <table className="w-full">

        <thead>

          <tr>

            <th>Code</th>
            <th>Status</th>
            <th>Used By</th>
            <th>Action</th>

          </tr>

        </thead>

        <tbody>

          {codes.map(code => (

            <tr key={code._id}>

              <td>{code.code}</td>

              <td>
                {code.active
                  ? "Active"
                  : "Disabled"}
              </td>

              <td>
                {code.usedBy?.email || "-"}
              </td>

              <td>

                {code.active && (

                  <button
                    onClick={() =>
                      disable(code._id)
                    }
                    className="text-red-600"
                  >
                    Disable
                  </button>

                )}

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
}