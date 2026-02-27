import * as Linking from "expo-linking";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  AppStateStatus,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,

  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

import API from "../api/api";
import { emitDashboardUpdate } from "../utils/events";

const MAX_SESSION_SECONDS = 30 * 60;
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];


export default function CallSessionScreen() {
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [weeklyCalls, setWeeklyCalls] = useState<number[]>([0,0,0,0,0,0,0]);

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const projectedMinutes = Math.floor(seconds / 60);
  const todayIndex = new Date().getDay();
  const todayCallMinutes = weeklyCalls[todayIndex] || 0;

  
  /* -----------------------------
     TIMER
  ------------------------------*/
  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= MAX_SESSION_SECONDS) {
          autoEndSession();
          return s;
        }
        return s + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  /* -----------------------------
     APP BACKGROUND PAUSE
  ------------------------------*/
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (
        appState.current === "active" &&
        next.match(/inactive|background/) &&
        running
      ) {
        setRunning(false);
        setPaused(true);
        Alert.alert("Session Paused", "App left foreground.");
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, [running]);

  /* -----------------------------
     LOAD WEEKLY CALLS
  ------------------------------*/
  const loadWeeklyCalls = async () => {
    try {
      const res = await API.get("/api/call/weekly");
      const mapped = new Array(7).fill(0);

      res.data.forEach((d: any) => {
        const day = new Date(d._id).getDay();
        mapped[day] = d.minutes;
      });

      setWeeklyCalls(mapped);
    } catch {}
  };

  useEffect(() => {
    loadWeeklyCalls();
  }, []);

  /* -----------------------------
     START
  ------------------------------*/
  const startSession = async () => {
    try {
      const res = await API.post("/api/call/start");
      setSessionId(res.data.sessionId);
      setSeconds(0);
      setRunning(true);
      setPaused(false);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed");
    }
  };

  /* -----------------------------
     END
  ------------------------------*/
  const endSession = async () => {
    if (!sessionId) return;

    setRunning(false);

    try {
      const res = await API.post("/api/call/end", { sessionId });

      emitDashboardUpdate(); // 🔥 refresh HomeScreen

      Alert.alert(
        "Session Completed",
        `+${res.data.creditedMinutes} minutes earned`
      );
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Failed");
    } finally {
      setSessionId(null);
      setSeconds(0);
      loadWeeklyCalls();
    }
  };

  const autoEndSession = async () => {
    if (!sessionId) return;
    setRunning(false);

    try {
      const res = await API.post("/api/call/end", { sessionId });
      emitDashboardUpdate();
      Alert.alert(
        "Session Ended",
        `Time limit reached.\n+${res.data.creditedMinutes} mins`
      );
    } finally {
      setSessionId(null);
      setSeconds(0);
      loadWeeklyCalls();
    }
  };

  const resumeSession = () => {
    setRunning(true);
    setPaused(false);
  };

  const openDialer = () => {
    Linking.openURL("tel:");
  };

  /* -----------------------------
     UI
  ------------------------------*/
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Session</Text>

      <Text style={styles.disclaimer}>
        Rewards may vary based on usage patterns and trust level.
      </Text>

      <Text style={styles.timer}>
        {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
      </Text>

      {running && MAX_SESSION_SECONDS - seconds <= 300 && (
        <Text style={styles.warning}>
          ⏱ Ends in {Math.ceil((MAX_SESSION_SECONDS - seconds) / 60)} min
        </Text>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weekly Call Minutes</Text>
        <Text style={styles.small}>Today: {todayCallMinutes} mins</Text>

        <LineChart
          data={{ labels: days, datasets: [{ data: weeklyCalls }] }}
          width={Dimensions.get("window").width - 40}
          height={220}
          fromZero
          bezier
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: () => "#0ea5a4",
            labelColor: () => "#000",
          }}
          style={{ borderRadius: 12, marginTop: 10 }}
        />
      </View>

      {!running && !paused && (
        <TouchableOpacity style={styles.start} onPress={startSession}>
          <Text style={styles.btnText}>Start Session</Text>
        </TouchableOpacity>
      )}

      {paused && (
        <TouchableOpacity style={styles.action} onPress={resumeSession}>
          <Text style={styles.actionText}>▶ Resume Session</Text>
        </TouchableOpacity>
      )}

      {running && (
        <>
          <TouchableOpacity style={styles.action} onPress={openDialer}>
            <Text style={styles.actionText}>📞 Open Dialer</Text>
          </TouchableOpacity>

          <Text style={styles.projection}>
            Estimated reward: {projectedMinutes} mins
          </Text>

          <TouchableOpacity style={styles.stop} onPress={endSession}>
            <Text style={styles.btnText}>End Session</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

/* -----------------------------
     STYLES
------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  timer: { fontSize: 42, fontWeight: "700", marginBottom: 6 },
  disclaimer: { fontSize: 11, color: "#64748b", marginBottom: 10 },
  warning: { color: "#ef4444", fontWeight: "600", marginBottom: 8 },

  card: {
    backgroundColor: "#f8fafb",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    marginBottom: 20,
  },

  cardTitle: { fontSize: 16, fontWeight: "600" },
  small: { fontSize: 12, color: "#666" },

  start: {
    backgroundColor: "#0ea5a4",
    padding: 16,
    borderRadius: 12,
    minWidth: 220,
    alignItems: "center",
  },

  stop: {
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    minWidth: 220,
    alignItems: "center",
    marginTop: 12,
  },

  action: {
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 10,
    minWidth: 220,
    alignItems: "center",
    marginBottom: 10,
  },

  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  actionText: { fontSize: 15, fontWeight: "600" },
  projection: { fontSize: 14, color: "#0ea5a4", marginTop: 6 },
});
