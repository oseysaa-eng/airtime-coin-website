"use client";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ScrollView } from "react-native";


import ProfileHeader from "./components/ProfileHeader";
import SettingsRow from "./components/SettingsRow";
import SettingsSection from "./components/SettingsSection";
import SettingsSwitchRow from "./components/SettingsSwitchRow";

import { useSettings } from "./hooks/useSettings";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  const {
    userName,
    userId,
    biometricEnabled,
    notificationsEnabled,
    toggleBiometric,
    toggleNotifications,
  } = useSettings();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f8fafc" }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* PROFILE */}
      <ProfileHeader name={userName} userId={userId} />

      {/* ACCOUNT */}
      <SettingsSection title="Account">
        <SettingsRow
          icon={<Ionicons name="person-outline" size={22} />}
          label="Edit Profile"
          onPress={() => navigation.navigate("EditProfile")}
        />

        <SettingsRow
          icon={<Ionicons name="wallet-outline" size={22} />}
          label="Manage Wallets"
          onPress={() => navigation.navigate("ManageWallets")}
        />
      </SettingsSection>

      {/* SECURITY */}
      <SettingsSection title="Security">
        <SettingsSwitchRow
          icon={
            <Ionicons
              name="finger-print-outline"
              size={22}
            />
          }
          label="Biometric Login"
          value={biometricEnabled}
          onChange={toggleBiometric}
        />

        <SettingsRow
          icon={<Ionicons name="key-outline" size={22} />}
          label="Withdrawal PIN"
          onPress={() => navigation.navigate("WithdrawalPin")}
        />

        <SettingsRow
          icon={<Ionicons name="lock-closed-outline" size={22} />}
          label="Change Password"
          onPress={() => navigation.navigate("ChangePassword")}
        />

        <SettingsRow
      icon={<Ionicons name="phone-portrait-outline" size={22} />}
      label="My Devices"
      onPress={() => navigation.navigate("Devices")}
    />
      </SettingsSection>

      {/* PREFERENCES */}
      <SettingsSection title="Preferences">
        <SettingsSwitchRow
          icon={
            <Ionicons
              name="notifications-outline"
              size={22}
            />
          }
          label="Notifications"
          value={notificationsEnabled}
          onChange={toggleNotifications}
        />

        <SettingsRow
          icon={<Ionicons name="language-outline" size={22} />}
          label="Language"
          onPress={() => navigation.navigate("Language")}
        />
      </SettingsSection>


      {/* LEGAL & SUPPORT */}
      <SettingsSection title="Help & Legal">
        <SettingsRow
          icon={<Ionicons name="information-circle-outline" size={22} />}
          label="About App"
          onPress={() => navigation.navigate("About")}
        />

        <SettingsRow
          icon={<Ionicons name="shield-checkmark-outline" size={22} />}
          label="Privacy Policy"
          onPress={() => navigation.navigate("Privacy")}
        />

        <SettingsRow
          icon={<Ionicons name="document-text-outline" size={22} />}
          label="Terms & Conditions"
          onPress={() => navigation.navigate("Terms")}
        />

        <SettingsRow
          icon={<Ionicons name="hardware-chip-outline" size={22} />}
          label="App Info"
          onPress={() => navigation.navigate("AppInfo")}
        />

        <SettingsRow
          icon={<Ionicons name="chatbox-ellipses-outline" size={22} />}
          label="Contact Support"
          onPress={() => navigation.navigate("Support")}
        />


              <SettingsRow
        icon={<Ionicons name="chatbubble-outline" size={22} />}
        label="Live Chat"
        onPress={() =>
          navigation.navigate("SupportChat")
        }
      />
      </SettingsSection>


      {/* LOGOUT */}
      <SettingsSection title=" ">
        <SettingsRow
          icon={
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#ef4444"
            />
          }
          label="Logout"
          danger
          onPress={() => navigation.navigate("Logout")}
        />
      </SettingsSection>
    </ScrollView>
  );
}