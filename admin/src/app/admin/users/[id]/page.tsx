"use client";

import adminApi from "@/lib/adminApi";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserDetailsPage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get(`/users/${id}`);
      setUser(res.data?.user);
    } catch (err) {
      console.error("User load error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadUser();
  }, [id]);

  if (loading)
    return <div className="p-6">Loading user…</div>;

  if (!user)
    return <div className="p-6">User not found</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        {user.email}
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <Stat title="Trust Score" value={user.trustScore ?? 0} />
        <Stat title="Balance ATC" value={user.balanceATC ?? 0} />
        <Stat title="Total Minutes" value={user.totalMinutes ?? 0} />
      </div>

      <Link
        href={`/admin/users/${id}/devices`}
        className="inline-block px-4 py-2 bg-black text-white rounded"
      >
        View Devices
      </Link>
    </div>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="p-4 border rounded bg-white">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}