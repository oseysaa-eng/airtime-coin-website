"use client";

import adminApi from "@/lib/adminApi";
import { useEffect, useState } from "react";

import BulkActionsBar from "@/components/admin/BulkActionsBar";
import UserDrawer from "@/components/admin/UserDrawer";
import UserRow from "@/components/admin/UserRow";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeUser, setActiveUser] = useState<any | null>(null);

  /* ─────────────────────────────
     LOAD USERS
  ───────────────────────────── */
  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await adminApi.get("/users");

      setUsers(res.data?.users || []);
    } catch (err: any) {
      console.error("Failed to load users", err);
      setError(
        err?.response?.data?.message || "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ─────────────────────────────
     SELECT HANDLING
  ───────────────────────────── */
  const toggleSelect = (id: string, checked: boolean) => {
    setSelected(prev =>
      checked ? [...prev, id] : prev.filter(x => x !== id)
    );
  };

  /* ───────────────────────────── */

  if (loading)
    return <div className="p-6">Loading users…</div>;

  if (error)
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">
        User Management
      </h1>

      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-zinc-100">
              <th className="p-2"></th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2">ATC</th>
              <th className="p-2">Minutes</th>
              <th className="p-2">KYC</th>
              <th className="p-2">Trust</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <UserRow
                key={u._id}
                user={u}
                selected={selected.includes(u._id)}
                onSelect={toggleSelect}
                onOpen={setActiveUser}
              />
            ))}
          </tbody>
        </table>

        {!users.length && (
          <p className="p-6 text-center text-gray-500">
            No users found
          </p>
        )}
      </div>

      {/* Drawer */}
      {activeUser && (
        <UserDrawer
          user={activeUser}
          onClose={() => setActiveUser(null)}
          onUpdated={() => {
            setActiveUser(null);
            load();
          }}
        />
      )}

      {/* Bulk Actions */}
      <BulkActionsBar
        selected={selected}
        onDone={() => {
          setSelected([]);
          load();
        }}
      />
    </div>
  );
}