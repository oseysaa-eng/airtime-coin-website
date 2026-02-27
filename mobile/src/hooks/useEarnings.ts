import { useEffect, useState, useCallback } from "react";
import axios from "axios";

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

  const fetchEarnings = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // 👇 Use local backend in dev, live API in production
      const baseURL =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5000"
          : "https://api.airtimecoin.com";

      const response = await axios.get(`${baseURL}/earnings`, {
        params: { user: userId },
      });

      setData(response.data.transactions || []);
    } catch (err: any) {
      console.error("Error fetching earnings:", err);
      setError(
        err.response?.data?.message || "Failed to fetch earnings. Try again."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  return { data, loading, error, refresh: fetchEarnings };
}
