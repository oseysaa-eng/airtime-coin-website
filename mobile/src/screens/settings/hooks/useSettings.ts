import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import API from "../../../api/api";
import { KycStatus } from "../types";

export function useSettings() {

  const [userName,setUserName] = useState("User");
  const [userId,setUserId] = useState("N/A");
  const [profileImage,setProfileImage] = useState<string | null>(null);

  const [biometricEnabled,setBiometricEnabled] = useState(false);
  const [notificationsEnabled,setNotificationsEnabled] = useState(true);

  const [kycStatus,setKycStatus] =
    useState<KycStatus>("not_submitted");

  useEffect(() => {

    loadLocal();
    loadUser();
    loadKyc();

  },[]);

  /* ─────────────────────────────
     LOAD LOCAL CACHE
  ───────────────────────────── */

  const loadLocal = async () => {

    const name = await AsyncStorage.getItem("userName");
    const id = await AsyncStorage.getItem("userId");
    const avatar = await AsyncStorage.getItem("avatar");

    if(name) setUserName(name);
    if(id) setUserId(id);
    if(avatar) setProfileImage(avatar);

    const bio = await AsyncStorage.getItem("biometricEnabled");
    const notif = await AsyncStorage.getItem("notificationsEnabled");

    if(bio) setBiometricEnabled(bio === "true");
    if(notif) setNotificationsEnabled(notif === "true");

  };

  /* ─────────────────────────────
     FETCH USER FROM BACKEND
  ───────────────────────────── */

  const loadUser = async () => {

    try{

      const res = await API.get("/api/summary");

      const data = res.data;

      const name = data.name || "User";
      const id = data.userId || "";
      const avatar = data.profileImage || null;

      setUserName(name);
      setUserId(id);
      setProfileImage(avatar);

      /* cache */

      await AsyncStorage.setItem("userName",name);
      await AsyncStorage.setItem("userId",id);

      if(avatar)
        await AsyncStorage.setItem("avatar",avatar);

    }catch(err){
      console.log("User fetch failed");
    }

  };

  /* ─────────────────────────────
     KYC STATUS
  ───────────────────────────── */

  const loadKyc = async () => {

    try{

      const res = await API.get("/api/kyc/status");

      setKycStatus(
        res.data?.status || "not_submitted"
      );

    }catch{

      setKycStatus("not_submitted");

    }

  };

  /* ─────────────────────────────
     BIOMETRIC TOGGLE
  ───────────────────────────── */

  const toggleBiometric = async (v:boolean) => {

    setBiometricEnabled(v);

    await AsyncStorage.setItem(
      "biometricEnabled",
      String(v)
    );

  };

  /* ─────────────────────────────
     NOTIFICATION TOGGLE
  ───────────────────────────── */

  const toggleNotifications = async (v:boolean) => {

    setNotificationsEnabled(v);

    await AsyncStorage.setItem(
      "notificationsEnabled",
      String(v)
    );

  };

  return {

    userName,
    userId,
    profileImage,
    kycStatus,

    biometricEnabled,
    notificationsEnabled,

    toggleBiometric,
    toggleNotifications

  };

}