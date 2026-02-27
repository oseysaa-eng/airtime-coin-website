import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KYC_OPEN_DATE } from "../constants/kyc";

const getRemainingTime = () => {
  const now = new Date().getTime();
  const distance = KYC_OPEN_DATE.getTime() - now;

  if (distance <= 0) {
    return null;
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    ),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
};

export default function KycStartScreen({ navigation }: any) {
  const [timeLeft, setTimeLeft] = useState(getRemainingTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const kycOpen = timeLeft === null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KYC Verification</Text>

      {!kycOpen ? (
        <>
          <Text style={styles.subtitle}>
            KYC will open after the early access period.
          </Text>

          <View style={styles.countdownBox}>
            <Text style={styles.countdown}>
              {timeLeft?.days}d {timeLeft?.hours}h{" "}
              {timeLeft?.minutes}m {timeLeft?.seconds}s
            </Text>
          </View>

          <Text style={styles.note}>
            You can continue earning and converting minutes while you wait.
          </Text>

          <TouchableOpacity style={styles.disabledBtn} disabled>
            <Text style={styles.btnText}>KYC Not Yet Available</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            KYC is now open. Please verify your identity.
          </Text>

          <TouchableOpacity
            style={styles.activeBtn}
            onPress={() => navigation.navigate("KYC")}
          >
            <Text style={styles.btnText}>Start KYC</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  countdownBox: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  countdown: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0ea5a4",
  },
  note: {
    fontSize: 12,
    color: "#777",
    marginBottom: 20,
    textAlign: "center",
  },
  disabledBtn: {
    backgroundColor: "#cbd5e1",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  activeBtn: {
    backgroundColor: "#0ea5a4",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
