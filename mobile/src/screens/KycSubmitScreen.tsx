// src/screens/KycSubmitScreen.tsx
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import API from "../api/api";

export default function KycSubmitScreen({ route, navigation }: any) {
  // route.params: { frontUri?, backUri?, selfieUri?, mode? } We'll pass through in flow.
  // For simplicity, the flow will send one image at a time and the screen helps collect all three.
  const [front, setFront] = useState(route.params.frontUri || null);
  const [back, setBack] = useState(route.params.backUri || null);
  const [selfie, setSelfie] = useState(route.params.selfieUri || null);
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!front || !back || !selfie) return Alert.alert("Incomplete", "Please provide front, back and selfie.");
    if (!idNumber || idNumber.trim().length < 3) return Alert.alert("ID number required", "Please enter your National ID number.");

    const fd = new FormData();
    fd.append("idNumber", idNumber.trim());
    fd.append("front", { uri: front, name: "front.jpg", type: "image/jpeg" } as any);
    fd.append("back", { uri: back, name: "back.jpg", type: "image/jpeg" } as any);
    fd.append("selfie", { uri: selfie, name: "selfie.jpg", type: "image/jpeg" } as any);

    try {
      setLoading(true);
      const res = await API.post("/api/kyc/submit", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setLoading(false);
      Alert.alert("Submitted", "KYC submitted. It will be reviewed shortly.");
      navigation.navigate("Profile");
    } catch (err: any) {
      setLoading(false);
      console.error("KYC submit error", err);
      Alert.alert("Error", err?.response?.data?.message || "Failed to submit KYC");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review & Submit</Text>

      <View style={styles.previewRow}>
        <Image source={{ uri: front }} style={styles.preview} />
        <Image source={{ uri: back }} style={styles.preview} />
      </View>

      <Image source={{ uri: selfie }} style={[styles.preview, { width: 120, height: 120, borderRadius: 60 }]} />

      <TextInput placeholder="National ID number (required)" style={styles.input} value={idNumber} onChangeText={setIdNumber} />

      <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit KYC</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 14 },
  previewRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  preview: { width: "48%", height: 160, borderRadius: 8, backgroundColor: "#eee" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 8, marginTop: 12 },
  btn: { marginTop: 18, backgroundColor: "#0ea5a4", padding: 14, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" }
});
