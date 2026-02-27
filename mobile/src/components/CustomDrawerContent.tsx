import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Appearance,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import api from "../api/api"; // your axios instance

export default function CustomDrawerContent(props: any) {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [balance, setBalance] = useState("0.00");

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(
    Appearance.getColorScheme() === "dark"
  );

  /* ───────────────────────────────
     LOAD USER + SETTINGS
  ─────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      const name = await AsyncStorage.getItem("userName");
      const email = await AsyncStorage.getItem("userEmail");
      const biometric = await AsyncStorage.getItem(
        "biometricEnabled"
      );

      setUserName(name || "User");
      setUserEmail(email || "");
      setBiometricEnabled(biometric === "true");
    };

    load();
    fetchBalance();
  }, []);

  /* ───────────────────────────────
     REAL-TIME BALANCE
  ─────────────────────────────── */
  const fetchBalance = async () => {
    try {
      const res = await api.get("/api/wallet/balance");
      setBalance(res.data.balance?.toFixed(2) || "0.00");
    } catch {
      // fallback
      const cached = await AsyncStorage.getItem(
        "atcBalance"
      );
      if (cached) setBalance(cached);
    }
  };

  /* ───────────────────────────────
     BIOMETRIC TOGGLE
  ─────────────────────────────── */
  const toggleBiometric = async (value: boolean) => {
    setBiometricEnabled(value);
    await AsyncStorage.setItem(
      "biometricEnabled",
      String(value)
    );
  };

  /* ───────────────────────────────
     DARK MODE TOGGLE
  ─────────────────────────────── */
  const toggleTheme = async (value: boolean) => {
    setDarkMode(value);
    await AsyncStorage.setItem(
      "theme",
      value ? "dark" : "light"
    );
  };

  /* ───────────────────────────────
     LOGOUT
  ─────────────────────────────── */
  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            props.navigation.replace("Login");
          },
        },
      ]
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
    >
      {/* ───────── HEADER ───────── */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={30}
            color="#fff"
          />
        </View>

        <Text style={styles.username}>
          {userName}
        </Text>
        <Text style={styles.email}>
          {userEmail}
        </Text>
      </View>

      {/* ───────── BALANCE ───────── */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>
          AirtimeCoin Balance
        </Text>
        <Text style={styles.balanceValue}>
          ₵ {balance}
        </Text>
      </View>

      {/* ───────── MENU ───────── */}
      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </View>

      {/* ───────── SETTINGS ───────── */}
      <View style={styles.settings}>
        <SettingRow
          icon="finger-print-outline"
          label="Biometric Login"
          value={biometricEnabled}
          onChange={toggleBiometric}
        />

        <SettingRow
          icon="moon-outline"
          label="Dark Mode"
          value={darkMode}
          onChange={toggleTheme}
        />
      </View>

      {/* ───────── LOGOUT ───────── */}
      <TouchableOpacity
        onPress={logout}
        style={styles.logout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#dc2626"
        />
        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

/* ======================================================
   SETTINGS ROW
====================================================== */

function SettingRow({
  icon,
  label,
  value,
  onChange,
}: any) {
  return (
    <View style={styles.toggleRow}>
      <Ionicons
        name={icon}
        size={20}
        color="#475569"
      />
      <Text style={styles.toggleLabel}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
      />
    </View>
  );
}

/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    backgroundColor: "#0ea5a4",
    paddingVertical: 28,
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  email: {
    color: "#e0f2f1",
    fontSize: 13,
  },

  balanceCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 18,
    padding: 16,
    elevation: 4,
  },

  balanceLabel: {
    fontSize: 13,
    color: "#64748b",
  },

  balanceValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 6,
  },

  settings: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  toggleLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#334155",
  },

  logout: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },

  logoutText: {
    marginLeft: 10,
    fontWeight: "600",
    color: "#dc2626",
  },
});