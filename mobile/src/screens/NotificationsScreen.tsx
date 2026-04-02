import React, { useEffect, useState } from "react";
import { View, Text, Switch, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../api/api";

export default function NotificationsScreen() {
  const [settings, setSettings] = useState({
    earnings: true,
    fraud: true,
    promo: true,
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem("notification_settings");
      if (saved) setSettings(JSON.parse(saved));
    };

    load();
  }, []);

  /* ================= UPDATE ================= */
  const updateSetting = async (key: string, value: boolean) => {
    const updated = { ...settings, [key]: value };

    setSettings(updated);
    setLoading(true);

    try {
      await AsyncStorage.setItem(
        "notification_settings",
        JSON.stringify(updated)
      );

      await API.post("/api/user/notifications/settings", {
        [key]: value,
      });

    } catch (err) {
      Alert.alert("Error", "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>

      <Item
        label="💰 Earnings Alerts"
        value={settings.earnings}
        onChange={(v) => updateSetting("earnings", v)}
      />

      <Item
        label="🚨 Fraud Alerts"
        value={settings.fraud}
        onChange={(v) => updateSetting("fraud", v)}
      />

      <Item
        label="🎁 Promotions"
        value={settings.promo}
        onChange={(v) => updateSetting("promo", v)}
      />
    </View>
  );
}

/* ================= COMPONENT ================= */

const Item = ({ label, value, onChange }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Switch value={value} onValueChange={onChange} />
  </View>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  label: { fontSize: 16 },
});