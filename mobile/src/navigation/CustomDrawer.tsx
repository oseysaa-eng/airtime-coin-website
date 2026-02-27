import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ storage
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { CommonActions, useNavigation } from "@react-navigation/native"; // ✅ navigation reset
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

const CustomDrawerContent = (props: any) => {
  const { isDark, toggleTheme } = useTheme();
  const [fingerprintEnabled, setFingerprintEnabled] = useState(true);
  const navigation = useNavigation(); // ✅ access nav

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // ✅ clear storage
            await AsyncStorage.clear();

            // ✅ reset navigation so user cannot go back
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: "Login" }], // 🔑 make sure LoginScreen is in your stack
              })
            );
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
      edges={["top", "left", "right", "bottom"]}
    >
      <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.username, { color: isDark ? "#fff" : "#000" }]}
          >
            John Doe
          </Text>
          <Text style={[styles.email, { color: isDark ? "#aaa" : "#666" }]}>
            johndoe@example.com
          </Text>
        </View>

        {/* Wallet Info */}
        <View style={styles.wallet}>
          <Text
            style={[styles.walletLabel, { color: isDark ? "#aaa" : "#666" }]}
          >
            ATC Balance
          </Text>
          <Text
            style={[styles.walletAmount, { color: isDark ? "#fff" : "#000" }]}
          >
            ₵12.50
          </Text>
        </View>

        {/* Navigation Items */}
        <View style={styles.body}>
          <DrawerItemList {...props} />
        </View>

        {/* Toggles */}
        <View style={styles.toggles}>
          <View style={styles.toggleRow}>
            <Ionicons
              name="finger-print"
              size={20}
              color={isDark ? "#fff" : "#333"}
            />
            <Text
              style={[styles.toggleLabel, { color: isDark ? "#fff" : "#000" }]}
            >
              Fingerprint Unlock
            </Text>
            <Switch
              value={fingerprintEnabled}
              onValueChange={(val) => setFingerprintEnabled(val)}
            />
          </View>

          <View style={styles.toggleRow}>
            <Ionicons
              name="moon-outline"
              size={20}
              color={isDark ? "#fff" : "#333"}
            />
            <Text
              style={[styles.toggleLabel, { color: isDark ? "#fff" : "#000" }]}
            >
              Dark Mode
            </Text>
            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Logout */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="red" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#ddd" },
  username: { fontSize: 18, fontWeight: "bold" },
  email: { fontSize: 14 },
  wallet: { padding: 16, borderBottomWidth: 1, borderColor: "#ddd" },
  walletLabel: { fontSize: 14 },
  walletAmount: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  body: { flex: 1, marginTop: 10 },
  toggles: { padding: 16 },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  toggleLabel: { flex: 1, marginLeft: 10, fontSize: 16 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "transparent",
  },
  logoutButton: { flexDirection: "row", alignItems: "center" },
  logoutText: { marginLeft: 10, fontSize: 16, color: "red" },
});

export default CustomDrawerContent;
