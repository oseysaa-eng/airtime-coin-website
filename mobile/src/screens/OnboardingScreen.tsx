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

  const finishOnboarding = async () => {
    await AsyncStorage.setItem("hasOnboarded", "true");
    navigation.replace("Register");
  };

  const screens = [
    {
      title: "Turn Airtime Into Value",
      text:
        "AirtimeCoin lets you convert unused airtime into real digital value. " +
        "No stress. No waste. Just value.",
    },
    {
      title: "Earn, Convert & Withdraw",
      text:
        "Earn minutes from calls, ads, and surveys. Convert them into ATC and " +
        "withdraw securely when you’re ready.",
    },
    {
      title: "Secure & Verified",
      text:
        "To protect your account and withdrawals, KYC verification is required. " +
        "Your data is encrypted and never shared.",
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

      {/* Actions */}
      <View style={styles.actions}>
        {step < 2 ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={finishOnboarding}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        )}

        {step < 2 && (
          <TouchableOpacity onPress={finishOnboarding}>
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