import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Airtime Coin (ATC)</Text>

      <Text style={styles.version}>Version 1.0.0</Text>

      <Text style={styles.text}>
        Airtime Coin (ATC) is a digital rewards platform that allows users to
        earn value from airtime usage, activities, and utilities.
      </Text>

      <Text style={styles.text}>
        Users can convert airtime into Airtime Coin, use ATC for utilities,
        earn rewards, and withdraw securely through supported payment channels.
      </Text>

      <Text style={styles.footer}>
        © {new Date().getFullYear()} Airtime Coin. All rights reserved.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  version: {
    color: "#64748b",
    marginBottom: 20,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
    color: "#334155",
  },
  footer: {
    marginTop: 30,
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});