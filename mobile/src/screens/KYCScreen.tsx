import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import API from "../api/api";

/* ======================================================
   CONFIG
====================================================== */

const KYC_COOLDOWN = 7973 * 60 * 60; // 7973 hours in seconds

/* ======================================================
   SCREEN
====================================================== */

export default function KYCScreen() {
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);

  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const [cooldown, setCooldown] = useState<number>(0);

  /* ======================================================
     PERMISSIONS
  ====================================================== */

  useEffect(() => {
    (async () => {
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cam.status !== "granted" || lib.status !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Camera and gallery permissions are required for KYC."
        );
      }
    })();
  }, []);

  /* ======================================================
     LOAD COOLDOWN ON OPEN
  ====================================================== */

  useEffect(() => {
    const loadCooldown = async () => {
      const saved = await AsyncStorage.getItem("kycSubmittedAt");
      if (!saved) return;

      const elapsed =
        Math.floor(Date.now() / 1000) - parseInt(saved, 10);

      const remaining = KYC_COOLDOWN - elapsed;

      if (remaining > 0) {
        setCooldown(remaining);
      }
    };

    loadCooldown();
  }, []);

  /* ======================================================
     COUNTDOWN TIMER
  ====================================================== */

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          AsyncStorage.removeItem("kycSubmittedAt");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  /* ======================================================
     IMAGE HANDLERS
  ====================================================== */

  const takePhoto = async (setter: (u: string) => void) => {
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!res.canceled && res.assets?.[0]?.uri) {
      setter(res.assets[0].uri);
    }
  };

  /* ======================================================
     SUBMIT KYC
  ====================================================== */

  const submit = async () => {
    if (cooldown > 0) {
      Alert.alert("Please wait", "KYC submission is on cooldown.");
      return;
    }

    if (!idNumber || idNumber.trim().length < 4) {
      return Alert.alert(
        "Missing ID Number",
        "Please enter your Ghana Card number."
      );
    }

    if (!frontUri || !backUri || !selfieUri) {
      return Alert.alert(
        "Missing Images",
        "Please upload ID front, ID back and selfie."
      );
    }

    setLoading(true);

    try {
      const form = new FormData();

      form.append("idNumber", idNumber.trim());

      form.append("front", {
        uri: frontUri,
        type: "image/jpeg",
        name: `front.jpg`,
      } as any);

      form.append("back", {
        uri: backUri,
        type: "image/jpeg",
        name: `back.jpg`,
      } as any);

      form.append("selfie", {
        uri: selfieUri,
        type: "image/jpeg",
        name: `selfie.jpg`,
      } as any);

      await API.post("/api/kyc", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await AsyncStorage.setItem(
        "kycSubmittedAt",
        Math.floor(Date.now() / 1000).toString()
      );

      setCooldown(KYC_COOLDOWN);

      Alert.alert(
        "KYC Submitted",
        "Your documents have been submitted successfully.\n\nPlease wait for review."
      );
    } catch (err: any) {
      Alert.alert(
        "Submission Failed",
        err?.response?.data?.message || "Unable to submit KYC."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     TIME FORMAT
  ====================================================== */

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>National ID Verification</Text>

      <Text style={styles.note}>
        Upload your Ghana Card front, back and a clear selfie.
      </Text>

      {/* FRONT + BACK */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => takePhoto(setFrontUri)}
        >
          <Text style={styles.boxTitle}>ID Front</Text>
          {frontUri ? (
            <Image source={{ uri: frontUri }} style={styles.preview} />
          ) : (
            <Text style={styles.boxHint}>Tap to capture</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.box}
          onPress={() => takePhoto(setBackUri)}
        >
          <Text style={styles.boxTitle}>ID Back</Text>
          {backUri ? (
            <Image source={{ uri: backUri }} style={styles.preview} />
          ) : (
            <Text style={styles.boxHint}>Tap to capture</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SELFIE */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.boxFull}
          onPress={() => takePhoto(setSelfieUri)}
        >
          <Text style={styles.boxTitle}>Selfie (face only)</Text>
          {selfieUri ? (
            <Image source={{ uri: selfieUri }} style={styles.preview} />
          ) : (
            <Text style={styles.boxHint}>Tap to capture</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ID NUMBER */}
      <View style={styles.section}>
        <Text style={styles.label}>Ghana Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="GHA-XXXXXXXX"
          value={idNumber}
          onChangeText={setIdNumber}
        />
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          cooldown > 0 && { backgroundColor: "#9ca3af" },
        ]}
        disabled={loading || cooldown > 0}
        onPress={submit}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : cooldown > 0 ? (
          <Text style={styles.submitText}>
            Retry in {formatTime(cooldown)}
          </Text>
        ) : (
          <Text style={styles.submitText}>Submit KYC</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },

  heading: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  note: { color: "#666", marginBottom: 14 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  box: {
    width: "48%",
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  boxFull: {
    width: "100%",
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  boxTitle: { fontWeight: "600", marginBottom: 6 },
  boxHint: { color: "#888" },

  preview: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginTop: 6,
  },

  section: { marginTop: 16 },

  label: { fontSize: 14, marginBottom: 8 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
  },

  submitBtn: {
    marginTop: 22,
    backgroundColor: "#0ea5a4",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
  },
});