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

/* ---------------- CONSTANTS ---------------- */
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ========================================================= */

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
    } catch {
      console.log("Weekly load error");
    }
  };

  /* ---------------- REPORT SPAM ---------------- */
  const reportSpam = async () => {
    if (!caller?.number) return;

    try {
      const res = await API.post("/api/call/report", {
        number: caller.number,
      });

      Alert.alert("Reported", `Reported ${res.data.reports} times`);
    } catch {
      Alert.alert("Error", "Failed to report");
    }
  };

  /* ---------------- SOCKET LISTENERS ---------------- */
  useEffect(() => {
    const socket = global.socket;
    if (!socket) return;

    /* -------- CALL START -------- */
    const onCallStart = (data: any) => {
      console.log("📞 UI CALL START", data);

      setCaller({
        ...data,
        spamStatus: data.spam || "unknown",
        spamLabel: data.spam || "Unknown",
      });

      setActive(true);
      setSeconds(0);

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    };

    /* -------- CALL END -------- */
    const onCallEnd = () => {
      console.log("📞 UI CALL END");

      if (intervalRef.current) clearInterval(intervalRef.current);

      setActive(false);
      setCaller(null);

      loadWeeklyCalls();
    };

    /* -------- WALLET UPDATE -------- */
    const onWalletUpdate = (data: any) => {
      console.log("💰 Wallet Updated:", data);

      Alert.alert(
        "Earnings Received 💰",
        `+${data.earnings.toFixed(3)} ATC`
      );
    };

    socket.on("CALL_STARTED", onCallStart);
    socket.on("CALL_ENDED", onCallEnd);
    socket.on("WALLET_UPDATE", onWalletUpdate);

    return () => {
      socket.off("CALL_STARTED", onCallStart);
      socket.off("CALL_ENDED", onCallEnd);
      socket.off("WALLET_UPDATE", onWalletUpdate);
    };
  }, []);

  /* ---------------- PERMISSION SETUP ---------------- */
  useEffect(() => {
    const setup = async () => {
      const hasPermission = await requestCallPermissions();

      if (!hasPermission) {
        Alert.alert("Permission required", "Enable phone permissions");
        return;
      }

      /* -------- Overlay -------- */
      const overlayAsked = await AsyncStorage.getItem("overlay_asked");

      if (!overlayAsked) {
        Alert.alert(
          "Enable Overlay",
          "Allow 'Appear on top'",
          [{ text: "Open Settings", onPress: () => Linking.openSettings() }]
        );
        await AsyncStorage.setItem("overlay_asked", "true");
      }

      /* -------- Battery -------- */
      Alert.alert(
        "Disable Battery Optimization",
        "Allow background activity",
        [{ text: "Open Settings", onPress: () => Linking.openSettings() }]
      );

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

      loadWeeklyCalls();
    };

    setup();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Mining</Text>

      <Text style={styles.disclaimer}>
        Calls longer than 10 seconds earn rewards automatically
      </Text>

      {/* -------- CALLER -------- */}
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

      {/* REPORT */}
      {caller && !caller.isSaved && (
        <Text onPress={reportSpam} style={styles.report}>
          🚫 Report as Spam
        </Text>
      )}

      {/* TIMER */}
      {active && (
        <Text style={styles.timer}>
          📞 {Math.floor(seconds / 60)}:
          {String(seconds % 60).padStart(2, "0")}
        </Text>
      )}

      {/* CHART */}
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