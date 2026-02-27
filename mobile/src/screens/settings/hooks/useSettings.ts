import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import API from "../../../api/api";
import { KycStatus } from ".././types";

export function useSettings() {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [kycStatus, setKycStatus] =
    useState<KycStatus>("not_submitted");

  const [userName, setUserName] = useState("User");
  const [userId, setUserId] = useState("N/A");

  useEffect(() => {
    loadLocal();
    loadKyc();
  }, []);

  const loadLocal = async () => {
    const name = await AsyncStorage.getItem("userName");
    const id = await AsyncStorage.getItem("userID");

    if (name) setUserName(name);
    if (id) setUserId(id);

    const bio = await AsyncStorage.getItem("biometricEnabled");
    const notif = await AsyncStorage.getItem("notificationsEnabled");

    if (bio) setBiometricEnabled(bio === "true");
    if (notif) setNotificationsEnabled(notif === "true");
  };

  const loadKyc = async () => {
    const email = await AsyncStorage.getItem("userEmail");
    if (!email) return;

    try {
      const res = await API.get("/api/kyc/status", {
        params: { email },
      });

      setKycStatus(res.data?.status || "not_submitted");
    } catch {
      setKycStatus("not_submitted");
    }
  };

  const toggleBiometric = async (v: boolean) => {
    setBiometricEnabled(v);
    await AsyncStorage.setItem(
      "biometricEnabled",
      String(v)
    );
  };

  const toggleNotifications = async (v: boolean) => {
    setNotificationsEnabled(v);
    await AsyncStorage.setItem(
      "notificationsEnabled",
      String(v)
    );
  };

  return {
    userName,
    userId,
    kycStatus,
    biometricEnabled,
    notificationsEnabled,
    toggleBiometric,
    toggleNotifications,
  };
}