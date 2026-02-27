import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SupportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Support</Text>

      <TouchableOpacity
        style={styles.row}
        onPress={() => Linking.openURL("mailto:support@airtimecoin.africa")}
      >
        <Ionicons name="mail-outline" size={22} />
        <Text style={styles.label}>support@airtimecoin.africa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          Linking.openURL("https://wa.me/233XXXXXXXXX")
        }
      >
        <Ionicons name="logo-whatsapp" size={22} color="#22c55e" />
        <Text style={styles.label}>WhatsApp Support</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Support hours: Monday – Friday (8am – 6pm)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  label: {
    marginLeft: 12,
    fontSize: 15,
  },
  note: {
    marginTop: 30,
    fontSize: 12,
    color: "#64748b",
  },
});