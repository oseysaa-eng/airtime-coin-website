import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Platform,
  Alert,
  Linking
} from "react-native";
import { LineChart } from "react-native-chart-kit";

import API from "../api/api";
import { initCallMining } from "../services/callDetector";
import AsyncStorage from "@react-native-async-storage/async-storage";





/* ---------------- PERMISSION ---------------- */
const requestCallPermissions = async () => {
  if (Platform.OS !== "android") return true;

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    ]);

    return (
      granted["android.permission.READ_PHONE_STATE"] === "granted" &&
      granted["android.permission.READ_CALL_LOG"] === "granted"
    );
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
    } catch {}
  };

  useEffect(() => {
    loadWeeklyCalls();
  }, []);

const requestOverlayPermission = async () => {
  if (Platform.OS !== "android") return;

  Alert.alert(
    "Enable Overlay",
    "Allow display over other apps",
    [
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openURL("package:" + "com.airtimecoin.app");
        },
      },
    ]
  );
};

const enableAccessibility = () => {
  Alert.alert(
    "Enable Call Mining",
    "Turn on Accessibility Service for call detection",
    [
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openSettings();
        },
      },
    ]
  );
};


  /* ---------------- AUTO CALL DETECTOR ---------------- */

  

useEffect(() => {

  const setup = async () => {

    const hasPermission = await requestCallPermissions();

    if (!hasPermission) {
      Alert.alert("Permission required");
      return;
    }

    // ✅ Show accessibility prompt only once
    const asked = await AsyncStorage.getItem("accessibility_asked");

    if (!asked) {
      Alert.alert(
        "Enable Call Mining",
        "Turn on Accessibility Service for call detection",
        [
          {
            text: "Open Settings",
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]
      );

      await AsyncStorage.setItem("accessibility_asked", "true");
    }

    initCallMining(
      () => {
        setActive(true);
        setSeconds(0);

        intervalRef.current = setInterval(() => {
          setSeconds((s) => s + 1);
        }, 1000);
      },
      async (duration: number) => {
        clearInterval(intervalRef.current);
        setActive(false);

        await API.post("/api/call/auto-credit", {
          seconds: duration
        });

        loadWeeklyCalls();
      }
    );
  };

  setup();

  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

}, []);



  useEffect(() => {

  const setup = async () => {

    const hasPermission = await requestCallPermissions();

    if (!hasPermission) {
      Alert.alert("Permission required", "Enable phone permissions to use call mining");
      return;
    }

    requestOverlayPermission();

    initCallMining(

      () => {
        setActive(true);
        setSeconds(0);

        intervalRef.current = setInterval(() => {
          setSeconds((s) => s + 1);
        }, 1000);
      },

      async (duration: number) => {

        clearInterval(intervalRef.current);
        setActive(false);

        await API.post("/api/call/auto-credit", {
          seconds: duration
        });

        loadWeeklyCalls();
      }

    );
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
        Calls above 5 minutes earn rewards automatically
      </Text>

      {active && (
        <Text style={styles.timer}>
          📞 {Math.floor(seconds / 60)}:
          {String(seconds % 60).padStart(2, "0")}
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

    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "700" },
  disclaimer: { fontSize: 12, color: "#64748b", marginVertical: 10 },
  timer: { fontSize: 36, fontWeight: "700", marginVertical: 10 },

  card: {
    backgroundColor: "#f8fafb",
    padding: 16,
    borderRadius: 12,
  },

  cardTitle: { fontSize: 16, fontWeight: "600" },
  small: { fontSize: 12, color: "#666" },
});