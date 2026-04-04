import { useEffect, useState, useCallback } from "react";
import API from "../api/api"; // ✅ use your interceptor
import { onSocketEvent } from "../services/socket";

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
}

export default function useEarnings(userId: string) {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* =============================
     FETCH FROM API
  ============================= */
  const fetchEarnings = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await API.get("/api/earnings", {
        params: { user: userId },
      });

      setData(res.data.transactions || []);
    } catch (err: any) {
      console.log("❌ Earnings fetch error:", err?.response?.data || err.message);

      setError(
        err?.response?.data?.message || "Failed to fetch earnings"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /* =============================
     INITIAL LOAD
  ============================= */
  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  /* =============================
     REALTIME UPDATE (🔥 IMPORTANT)
  ============================= */
  useEffect(() => {
    let cleanup: any;

    const init = async () => {
      cleanup = await onSocketEvent("MINUTES_CREDIT", (payload) => {
        if (!payload) return;

        console.log("💰 Live earning:", payload);

        const newTx: Transaction = {
          id: Date.now().toString(),
          type: "call",
          amount: payload.amount || 0,
          date: new Date().toISOString(),
        };

        // ✅ prepend new earning
        setData((prev) => [newTx, ...prev]);
      });
    };

    init();

    return () => {
      cleanup && cleanup();
    };
  }, []);

  return {
    data,
    loading,
    error,
    refresh: fetchEarnings,
  };
}