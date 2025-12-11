"use client";

import { useEffect, useState } from "react";

type WaitlistUser = {
  email: string;
  phone: string;
  createdAt: string;
};

export default function Admin() {
  const [waitlist, setWaitlist] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/waitlist", {
          headers: {
            "x-admin-secret": process.env.NEXT_PUBLIC_ADMIN_SECRET!,
          },
        });

        if (!res.ok) {
          throw new Error("Unauthorized or failed to load data.");
        }

        const data = await res.json();
        setWaitlist(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-2">
        Airtime Coin – Admin Panel
      </h1>
      <p className="text-gray-400 mb-8">
        Waitlist submissions from landing page
      </p>

      {/* STATUS */}
      {loading && (
        <p className="text-yellow-400">
          Loading waitlist...
        </p>
      )}

      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}

      {/* DATA TABLE */}
      {!loading && !error && (
        <div className="overflow-x-auto border border-gray-800 rounded-xl">
          <table className="w-full border-collapse">
            <thead className="bg-gray-900">
              <tr>
                <th className="p-3 text-left border-b border-gray-800">
                  #
                </th>
                <th className="p-3 text-left border-b border-gray-800">
                  Email
                </th>
                <th className="p-3 text-left border-b border-gray-800">
                  Phone
                </th>
                <th className="p-3 text-left border-b border-gray-800">
                  Signup Date
                </th>
              </tr>
            </thead>

            <tbody>
              {waitlist.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    No users on the waitlist yet.
                  </td>
                </tr>
              )}

              {waitlist.map((u, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-900 transition"
                >
                  <td className="p-3 border-b border-gray-800 text-gray-400">
                    {i + 1}
                  </td>

                  <td className="p-3 border-b border-gray-800">
                    {u.email}
                  </td>

                  <td className="p-3 border-b border-gray-800">
                    {u.phone}
                  </td>

                  <td className="p-3 border-b border-gray-800 text-gray-400">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
