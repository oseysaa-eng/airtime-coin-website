import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function TermsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Terms & Conditions</Text>

      <Text style={styles.text}>
        By using Airtime Coin, you agree to the following terms:
      </Text>

      <Text style={styles.text}>
        • Airtime Coin is not a bank{"\n"}
        • ATC value may change based on usage and system rules{"\n"}
        • Fraudulent activity may result in suspension{"\n"}
        • Users are responsible for account security{"\n"}
        • Withdrawals require identity verification
      </Text>

      <Text style={styles.text}>
        Airtime Coin reserves the right to update these terms at any time.
      </Text>

      <Text style={styles.text}>
        Continued use of the app implies acceptance of updated terms.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 12 },
  text: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
    color: "#334155",
  },
});