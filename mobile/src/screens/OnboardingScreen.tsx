import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);

  const finishOnboarding = async () => {
    if (!accepted) return;

    await AsyncStorage.setItem("hasOnboarded", "true");
    navigation.replace("Register");
  };

  const screens = [
    {
      title: "Turn Airtime Into Digital Value",
      text:
        "AirtimeCoin allows you to convert eligible airtime usage into ATC, " +
        "a digital reward within the platform.",
    },
    {
      title: "Earn Responsibly",
      text:
        "Earn through calls, ads, and surveys. Rewards are subject to system rules, " +
        "limits, and fraud protection.",
    },
    {
      title: "Secure & Verified",
      text:
        "To protect users and withdrawals, identity verification (KYC) is required. " +
        "Your data is securely encrypted.",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progress}>
        {screens.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              step === i && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{screens[step].title}</Text>
        <Text style={styles.text}>{screens[step].text}</Text>
      </View>

      {/* Consent (ONLY LAST SCREEN) */}
      {step === screens.length - 1 && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAccepted(!accepted)}
        >
          <View
            style={[
              styles.checkbox,
              accepted && styles.checkboxActive,
            ]}
          />
          <Text>
  I agree to the{" "}
  <Text onPress={() => navigation.navigate("Terms")}>Terms</Text> &{" "}
  <Text onPress={() => navigation.navigate("Privacy")}>Privacy Policy</Text>
</Text>
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {step < screens.length - 1 ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              !accepted && styles.disabledButton,
            ]}
            onPress={finishOnboarding}
            disabled={!accepted}
          >
            <Text style={styles.buttonText}>
              Get Started
            </Text>
          </TouchableOpacity>
        )}

       
        {step < screens.length - 1 && (
          <TouchableOpacity
            onPress={() => setStep(screens.length - 1)}
          >
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    backgroundColor: "#ffffff",
    justifyContent: "space-between",
  },

  progress: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 60,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 6,
  },

  activeDot: {
    backgroundColor: "#0ea5a4",
    width: 20,
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    color: "#111827",
  },

  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#4b5563",
    lineHeight: 24,
  },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#0ea5a4",
    marginRight: 10,
    borderRadius: 4,
  },

  checkboxActive: {
    backgroundColor: "#0ea5a4",
  },

  checkboxText: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
  },

  actions: {
    marginBottom: 50,
  },

  button: {
    backgroundColor: "#0ea5a4",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 14,
  },

  disabledButton: {
    backgroundColor: "#94a3b8",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  skip: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: 14,
  },
});