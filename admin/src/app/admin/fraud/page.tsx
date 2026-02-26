"use client";

import adminApi from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import FraudHeatmap from "./components/FraudHeatmap";
import FraudKPI from "./components/FraudKPI";
import FraudTimeline from "./components/FraudTimeline";
import RiskyUsersTable from "./components/RiskyUsersTable";

export default function FraudPage() {
  const router = useRouter();

  const [overview, setOverview] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const res = await adminApi.get(
          "/fraud/dashboard"
        );

        setOverview(res.data.overview);
        setTimeline(res.data.timeline);
        setUsers(res.data.users);
        setHeatmap(res.data.heatmap);
      } catch (err) {
        console.error("Fraud dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <p className="p-6 text-gray-500">
        Loading fraud analytics…
      </p>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">
        Fraud & Abuse Monitor
      </h1>

      <FraudKPI data={overview} />

      <FraudHeatmap data={heatmap} />

      <FraudTimeline events={timeline} />

      <RiskyUsersTable users={users} />
    </div>
  );
}