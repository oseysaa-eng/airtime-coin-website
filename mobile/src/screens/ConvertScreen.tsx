import { Slider } from "@miblanchard/react-native-slider";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import API from "../api/api";
import { emitDashboardUpdate } from "../utils/events";

export default function ConvertScreen() {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [loading, setLoading] = useState(false);

  const [rate, setRate] = useState(0);
  const [minConvert, setMinConvert] = useState(10);

  useEffect(() => {
    loadWallet();
    loadConfig();
  }, []);

  /* ================= LOAD WALLET ================= */
  const loadWallet = async () => {
    try {
      const res = await API.get("/api/summary");

      const mins = res.data.totalMinutes || 0;

      setTotalMinutes(mins);

      // 🔥 clamp slider if needed
      if (minutes > mins) {
        setMinutes(mins);
      }

    } catch {
      Alert.alert("Error", "Failed to load wallet");
    }
  };

  /* ================= LOAD RATE ================= */
  const loadConfig = async () => {
    try {
      const res = await API.get("/api/convert/config");

      setRate(res.data.rate);
      setMinConvert(res.data.minConvertMinutes || 10);

    } catch {
      console.log("⚠️ Using fallback rate");
      setRate(0.0025);
    }
  };

  /* ================= CONVERT ================= */
  const convert = async () => {
    if (minutes < minConvert) {
      Alert.alert(
        "Minimum Required",
        `Minimum ${minConvert} minutes required`
      );
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/api/convert", { minutes });

      Alert.alert(
        "Success 🎉",
        `${res.data.atcReceived.toFixed(4)} ATC credited`
      );

      setMinutes(0);

      emitDashboardUpdate();
      loadWallet();

    } catch (err: any) {
      Alert.alert(
        "Conversion Failed",
        err.response?.data?.message || "Try again"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= ESTIMATION ================= */
  const estimatedATC = (() => {
    if (!rate) return "0.0000";

    const PROFIT_CUT = 0.9; // 🔥 match backend (10% cut)
    return (minutes * rate * PROFIT_CUT).toFixed(4);
  })();

  /* ================= UI ================= */

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Convert Airtime</Text>

      {/* WALLET */}
      <View style={styles.card}>
        <Text style={styles.label}>Available Minutes</Text>
        <Text style={styles.value}>{totalMinutes} mins</Text>
      </View>

      {/* SLIDER */}
      <View style={styles.card}>
        <Text style={styles.label}>Select Minutes</Text>

        <Text style={styles.minutes}>{minutes} mins</Text>

        <Slider
          value={minutes}
          onValueChange={(v) => setMinutes(Math.floor(v[0]))}
          minimumValue={0}
          maximumValue={totalMinutes}
          step={10}
          trackStyle={styles.track}
          thumbStyle={styles.thumb}
          minimumTrackTintColor="#0ea5a4"
          maximumTrackTintColor="#e5e7eb"
        />

        <Text style={styles.estimate}>
          ≈ {estimatedATC} ATC
        </Text>
      </View>

      {/* RATE */}
      <View style={styles.card}>
        <Text style={styles.rate}>
          Rate: dynamic
        </Text>
      </View>

      {/* BUTTON */}
      <View style={styles.buttonWrap}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.button} onPress={convert}>
            Convert Now
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#f8fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: "#6b7280",
  },

  value: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 6,
  },

  minutes: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 10,
  },

  track: {
    height: 6,
    borderRadius: 6,
  },

  thumb: {
    height: 22,
    width: 22,
    backgroundColor: "#0ea5a4",
    borderRadius: 11,
  },

  estimate: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#0ea5a4",
  },

  rate: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
  },

  buttonWrap: {
    marginTop: 20,
  },

  button: {
    backgroundColor: "#0ea5a4",
    color: "#ffffff",
    textAlign: "center",
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: "700",
  },
});