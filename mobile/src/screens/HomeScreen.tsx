import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { LineChart } from "react-native-chart-kit";
import API from "../api/api";
import { useWallet } from "../context/WalletContext";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import { subscribeDashboard } from "../utils/events";

const screenWidth = Dimensions.get("window").width;

type Tx = {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  source: string;
  createdAt: string;
};

type Dashboard = {
  name: string;
  balance: number;
  totalMinutes: number;
  todayMinutes: number;
  weeklyMinutes: number[];
  recentTx: Tx[];
  earlyAdopter?: boolean;
  trustStatus?: "good" | "reduced" | "limited" | "blocked";
};

const defaultChart = [0, 0, 0, 0, 0, 0, 0];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { wallet } = useWallet();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [price, setPrice] = useState<any>(null);

  /* ───────────── FETCH ───────────── */

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/api/summary");
      setDashboard(res.data);
    } catch (e) {
      console.log("Dashboard error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPrice = async () => {
    const res = await API.get("/api/price");
    setPrice(res.data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
      loadPrice();
    }, [])
  );

  useEffect(() => {
    const unsub = subscribeDashboard(fetchDashboard);
    return unsub;
  }, []);

  /* ───────────── SAFE VALUES ───────────── */

  const atcValue = wallet.atc ?? dashboard?.balance ?? 0;
  const minutesValue = wallet.minutes ?? dashboard?.totalMinutes ?? 0;

  const animatedATC = useAnimatedNumber(atcValue);
  const animatedMinutes = useAnimatedNumber(minutesValue);

  /* ───────────── UI STATES ───────────── */

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={s.center}>
        <Text>No data available</Text>
      </View>
    );
  }

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data:
          dashboard.weeklyMinutes?.length > 0
            ? dashboard.weeklyMinutes
            : defaultChart,
        strokeWidth: 3,
      },
    ],
  };

  /* ───────────── RENDER ───────────── */

  return (
    <ScrollView
      style={s.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={fetchDashboard}
        />
      }
    >
      <Text style={s.title}>Welcome, {dashboard.name}</Text>

      {/* BETA NOTICE */}
      <View style={s.betaBox}>
        <Text style={s.betaText}>
          🧪 Beta Mode — Rewards are limited and subject to change.
        </Text>
      </View>

      {/* LIVE */}
      <View style={s.liveRow}>
        <View style={s.liveDot} />
        <Text style={s.liveText}>Live updates enabled</Text>
      </View>

      {/* ATC BALANCE */}
      <TouchableOpacity
        style={s.primaryCard}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("BuyUtility", {
            mode: "ATC_TO_AIRTIME",
          })
        }
      >
        <Text style={s.primaryTitle}>ATC Balance</Text>
        <Text style={s.primaryBalance}>
          {animatedATC.toFixed(6)} ATC
        </Text>
        <Text style={s.primaryHint}>Tap to buy airtime or data</Text>
      </TouchableOpacity>

      {/* PRICE */}
      {price && (
        <View style={s.card}>
          <Text style={s.cardTitle}>ATC Live Price</Text>
          <Text style={s.balance}>
            1 ATC = ₵{price.price?.toFixed(4)}
          </Text>
        </View>
      )}

      {/* MINUTES */}
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Convert")}
      >
        <View style={s.row}>
          <Text style={s.cardTitle}>Airtime Minutes</Text>
          <Ionicons name="swap-horizontal-outline" size={22} color="#0ea5a4" />
        </View>

        <Text style={s.balance}>
          {Math.floor(animatedMinutes)} mins
        </Text>

        <Text style={s.hint}>
          Today: {dashboard.todayMinutes} mins
        </Text>
      </TouchableOpacity>

      {/* TRUST */}
      {dashboard.trustStatus && (
        <View style={s.trustCard}>
          <Text style={s.trustTitle}>Account Trust Level</Text>
          <View style={s.progressBg}>
            <View
              style={[
                s.progressFill,
                {
                  width:
                    dashboard.trustStatus === "good"
                      ? "100%"
                      : dashboard.trustStatus === "reduced"
                      ? "70%"
                      : dashboard.trustStatus === "limited"
                      ? "30%"
                      : "5%",
                  backgroundColor:
                    dashboard.trustStatus === "good"
                      ? "#22c55e"
                      : dashboard.trustStatus === "reduced"
                      ? "#f59e0b"
                      : "#ef4444",
                },
              ]}
            />
          </View>
          <Text style={s.trustHint}>
            Status: {dashboard.trustStatus.toUpperCase()}
          </Text>
        </View>
      )}

      {/* CHART */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Weekly Minutes</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          bezier
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: o => `rgba(14,165,164,${o})`,
            labelColor: () => "#64748b",
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: "#0ea5a4",
            },
            propsForBackgroundLines: {
              strokeDasharray: "4",
              stroke: "#e5e7eb",
            },
          }}
          style={{ marginTop: 14, borderRadius: 18 }}
        />
      </View>

      {/* TRANSACTIONS */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Recent Transactions</Text>

        {dashboard.recentTx.length === 0 && (
          <Text style={s.hint}>No transactions yet</Text>
        )}

        {dashboard.recentTx.map(tx => (
          <View key={tx._id} style={s.txRow}>
            <Text>
              {tx.type === "credit" ? "+" : "-"}
              {tx.amount} — {tx.source}
            </Text>
            <Text style={s.txDate}>
              {new Date(tx.createdAt).toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ───────────── STYLES ───────────── */

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  title: { fontSize: 26, fontWeight: "800", marginBottom: 10 },

  betaBox: {
    backgroundColor: "#fff7ed",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  betaText: { fontSize: 12, color: "#92400e" },

  liveRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 6,
  },
  liveText: { fontSize: 12, color: "#64748b" },

  card: {
    backgroundColor: "#f8fafb",
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
  },

  primaryCard: {
    backgroundColor: "#0ea5a4",
    padding: 20,
    borderRadius: 20,
    marginBottom: 18,
  },

  primaryTitle: { color: "#ecfeff", fontSize: 14 },
  primaryBalance: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 6,
  },
  primaryHint: { color: "#ccfbf1", fontSize: 12, marginTop: 6 },

  cardTitle: { fontSize: 14, fontWeight: "600", color: "#475569" },
  balance: { fontSize: 28, fontWeight: "800", marginTop: 6 },
  hint: { fontSize: 12, color: "#64748b", marginTop: 6 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  txRow: { marginTop: 10 },
  txDate: { fontSize: 11, color: "#64748b" },

  trustCard: {
    backgroundColor: "#f8fafb",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  trustTitle: { fontWeight: "700", marginBottom: 8 },

  progressBg: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: 10,
    borderRadius: 999,
  },

  trustHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748b",
  },
});