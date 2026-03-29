import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

import API from "../api/api";
import { initCallMining } from "../services/callDetector";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ---------------- PERMISSIONS ---------------- */
const requestCallPermissions = async () => {
  if (Platform.OS !== "android") return true;

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    ]);

    return Object.values(granted).every((p) => p === "granted");
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CallMiningScreen() {
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(false);
  const [weeklyCalls, setWeeklyCalls] = useState<number[]>([0,0,0,0,0,0,0]);
  const [caller, setCaller] = useState<any>(null);

  const intervalRef = useRef<any>(null);

  const todayIndex = new Date().getDay();
  const todayCallMinutes = weeklyCalls[todayIndex] || 0;

  /* ---------------- LOAD WEEKLY ---------------- */
  const loadWeeklyCalls = async () => {
    try {
      const res = await API.get("/api/call/weekly");

      const mapped = new Array(7).fill(0);

      res.data.forEach((d: any) => {
        const day = new Date(d._id).getDay();
        mapped[day] = d.minutes;
      });

      setWeeklyCalls(mapped);
    } catch (e) {
      console.log("Weekly load error");
    }
  };

  /* ---------------- SPAM CHECK ---------------- */
  const checkSpam = async (number: string) => {
    try {
      const res = await API.post("/api/call/check-number", { number });
      return res.data;
    } catch {
      return { status: "unknown", label: "Unknown" };
    }
  };

  /* ---------------- REPORT SPAM ---------------- */
  const reportSpam = async () => {
    if (!caller?.number) return;

    try {
      const res = await API.post("/api/call/report", {
        number: caller.number,
      });

      Alert.alert(
        "Reported",
        `Reported ${res.data.reports} times`
      );
    } catch {
      Alert.alert("Error", "Failed to report");
    }
  };

  /* ---------------- MAIN EFFECT ---------------- */
  useEffect(() => {
    let cleanupMining: any;

    const setup = async () => {
      const hasPermission = await requestCallPermissions();

      if (!hasPermission) {
        Alert.alert("Permission required", "Enable phone permissions");
        return;
      }

      /* -------- Overlay Permission -------- */
      const overlayAsked = await AsyncStorage.getItem("overlay_asked");

      if (!overlayAsked) {
        Alert.alert(
          "Enable Overlay",
          "Allow 'Appear on top' for call mining",
          [{ text: "Open Settings", onPress: () => Linking.openSettings() }]
        );
        await AsyncStorage.setItem("overlay_asked", "true");
      }

      /* -------- Accessibility -------- */
      const accessAsked = await AsyncStorage.getItem("accessibility_asked");

      if (!accessAsked) {
        Alert.alert(
          "Enable Call Mining",
          "Turn on Accessibility Service",
          [{ text: "Open Settings", onPress: () => Linking.openSettings() }]
        );
        await AsyncStorage.setItem("accessibility_asked", "true");
      }

      /* -------- START ENGINE -------- */
      cleanupMining = initCallMining(
        async (data) => {
          const spamInfo = await checkSpam(data.number);

          const enrichedCaller = {
            ...data,
            spamStatus: spamInfo.status,
            spamLabel: spamInfo.label,
          };

          setCaller(enrichedCaller);
          setActive(true);
          setSeconds(0);

          if (intervalRef.current) clearInterval(intervalRef.current);

          intervalRef.current = setInterval(() => {
            setSeconds((s) => s + 1);
          }, 1000);
        },

        async () => {
          // ❌ REMOVED auto-credit call
          if (intervalRef.current) clearInterval(intervalRef.current);

          setActive(false);
          setCaller(null);

          // ✅ Just refresh stats
          loadWeeklyCalls();
        }
      );
    };

    setup();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (cleanupMining) cleanupMining();
    };
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Mining</Text>

      <Text style={styles.disclaimer}>
        Calls above 5 minutes earn rewards automatically
      </Text>

      {/* -------- CALLER INFO -------- */}
      {caller && (
        <View style={{ marginVertical: 10 }}>
          <Text style={styles.name}>{caller.name}</Text>

          <Text style={styles.number}>
            {caller.number} • {caller.isSaved ? "Saved" : "Unknown"}
          </Text>

          {caller.spamStatus !== "safe" && (
            <Text
              style={{
                marginTop: 5,
                color: caller.spamStatus === "spam" ? "red" : "#f59e0b",
                fontWeight: "600",
              }}
            >
              {caller.spamLabel}
            </Text>
          )}
        </View>
      )}

      {/* 🚫 REPORT BUTTON */}
      {caller && !caller.isSaved && (
        <Text onPress={reportSpam} style={styles.report}>
          🚫 Report as Spam
        </Text>
      )}

      {/* ⏱ TIMER */}
      {active && (
        <Text style={styles.timer}>
          📞 {Math.floor(seconds / 60)}:
          {String(seconds % 60).padStart(2, "0")}
        </Text>
      )}

      {/* 📊 CHART */}
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
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  title: { fontSize: 22, fontWeight: "700" },
  disclaimer: { fontSize: 12, color: "#64748b", marginVertical: 10 },

  name: { fontSize: 16, fontWeight: "700" },
  number: { fontSize: 13, color: "#64748b" },

  report: {
    marginTop: 10,
    color: "red",
    fontWeight: "600",
  },

  timer: { fontSize: 36, fontWeight: "700", marginVertical: 10 },

  card: {
    backgroundColor: "#f8fafb",
    padding: 16,
    borderRadius: 12,
  },

  cardTitle: { fontSize: 16, fontWeight: "600" },
  small: { fontSize: 12, color: "#666" },
});