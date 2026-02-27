import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function PrivacyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>

      <Text style={styles.text}>
        Airtime Coin respects your privacy and is committed to protecting your
        personal information.
      </Text>

      <Text style={styles.subtitle}>Information We Collect</Text>
      <Text style={styles.text}>
        • Account details (email, phone number){"\n"}
        • Device information for security{"\n"}
        • Transaction records{"\n"}
        • KYC information where required
      </Text>

      <Text style={styles.subtitle}>How We Use Your Data</Text>
      <Text style={styles.text}>
        • To provide secure services{"\n"}
        • Prevent fraud{"\n"}
        • Improve app performance{"\n"}
        • Meet regulatory requirements
      </Text>

      <Text style={styles.subtitle}>Security</Text>
      <Text style={styles.text}>
        We apply industry-standard encryption and security practices to protect
        your data.
      </Text>

      <Text style={styles.subtitle}>Contact</Text>
      <Text style={styles.text}>
        For privacy questions, contact support@airtimecoin.africa
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 10 },
  subtitle: {
    marginTop: 16,
    fontWeight: "700",
    fontSize: 15,
  },
  text: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: "#334155",
  },
});