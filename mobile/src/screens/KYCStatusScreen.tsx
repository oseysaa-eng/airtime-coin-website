import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../api/api";

/* ----------------------------------
   CONFIG
----------------------------------- */

// 48 hours review window
const REVIEW_DURATION = 48 * 60 * 60 * 1000;

export default function KycStatusScreen({ navigation }: any) {
  const [status, setStatus] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* ----------------------------------
     LOAD KYC STATUS
  ----------------------------------- */

  const loadStatus = async () => {
    try {
      const res = await API.get("/api/kyc/status");

      const kyc = res.data.kyc;

      setStatus(kyc?.status || "not_submitted");

      if (kyc?.submittedAt) {
        setSubmittedAt(new Date(kyc.submittedAt).getTime());
      }
    } catch (err) {
      console.log("KYC status error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();

    // auto refresh every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ----------------------------------
     TIMER LOGIC
  ----------------------------------- */

  useEffect(() => {
    if (!submittedAt || status !== "pending") return;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const end = submittedAt + REVIEW_DURATION;
      const diff = Math.max(0, end - now);
      setRemainingMs(diff);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submittedAt, status]);

  /* ----------------------------------
     TIME FORMAT
  ----------------------------------- */

  const formatTime = (ms: number) => {
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return `${h}h ${m}m ${s}s`;
  };

  const progress =
    submittedAt && status === "pending"
      ? Math.min(
          100,
          ((REVIEW_DURATION - remainingMs) / REVIEW_DURATION) * 100
        )
      : 0;

  /* ----------------------------------
     UI STATES
  ----------------------------------- */

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KYC Status</Text>

      <View style={styles.card}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <Text style={styles.statusValue}>
          {status?.replace("_", " ").toUpperCase()}
        </Text>
      </View>

      {/* ----------------------------------
          NOT SUBMITTED
      ----------------------------------- */}
      {status === "not_submitted" && (
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("KycStart")}
        >
          <Text style={styles.btnText}>Start KYC</Text>
        </TouchableOpacity>
      )}

      {/* ----------------------------------
          REJECTED
      ----------------------------------- */}
      {status === "rejected" && (
        <>
          <Text style={styles.warn}>
            ❌ Your documents were rejected. Please resubmit clear images.
          </Text>

          <TouchableOpacity
            style={styles.btn}
            onPress={() => navigation.navigate("KycSubmit")}
          >
            <Text style={styles.btnText}>Resubmit KYC</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ----------------------------------
          VERIFIED
      ----------------------------------- */}
      {status === "verified" && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            ✅ Identity verified successfully.
          </Text>
          <Text style={styles.small}>
            You can now withdraw, stake, and use all features.
          </Text>
        </View>
      )}

      {/* ----------------------------------
          PENDING + TIMER
      ----------------------------------- */}
      {status === "pending" && (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingTitle}>
            ⏳ Verification in progress
          </Text>

          <Text style={styles.small}>
            Typical review time: up to 48 hours
          </Text>

          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>

          <Text style={styles.timerText}>
            Estimated time remaining:
          </Text>

          <Text style={styles.timerValue}>
            {formatTime(remainingMs)}
          </Text>
        </View>
      )}
    </View>
  );
}

/* ----------------------------------
   STYLES
----------------------------------- */

const styles = StyleSheet.create({
  container: {
    padding: 22,
    backgroundColor: "#fff",
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#f8fafb",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },

  statusLabel: {
    fontSize: 13,
    color: "#64748b",
  },

  statusValue: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
    color: "#0f172a",
  },

  btn: {
    marginTop: 20,
    backgroundColor: "#0ea5a4",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  warn: {
    color: "#b91c1c",
    marginTop: 10,
    fontSize: 13,
  },

  successBox: {
    marginTop: 20,
    backgroundColor: "#ecfeff",
    borderColor: "#0ea5a4",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
  },

  successText: {
    fontWeight: "800",
    color: "#0ea5a4",
    marginBottom: 4,
  },

  pendingBox: {
    marginTop: 20,
    backgroundColor: "#f8fafb",
    padding: 16,
    borderRadius: 14,
  },

  pendingTitle: {
    fontWeight: "800",
    marginBottom: 6,
  },

  progressBg: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    marginTop: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: 10,
    backgroundColor: "#0ea5a4",
    borderRadius: 999,
  },

  timerText: {
    marginTop: 12,
    fontSize: 12,
    color: "#64748b",
  },

  timerValue: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
    color: "#0f172a",
  },

  small: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
});