// src/screens/KycStartScreen.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function KycStartScreen({ navigation }: any) {
  return (
    <View style={s.container}>
      <Text style={s.title}>Verify your National ID</Text>
      <Text style={s.note}>You must complete KYC before staking or withdrawing.</Text>

      <View style={s.box}>
        <Text style={s.boxTitle}>What you'll need</Text>
        <Text>- National ID (front and back)</Text>
        <Text>- A clear selfie (face only)</Text>
      </View>

      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate("KycCamera", { mode: "idFront" })}>
        <Text style={s.btnText}>Start Verification</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  note: { color: "#666", marginBottom: 14 },
  box: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 8, marginBottom: 16 },
  boxTitle: { fontWeight: "700", marginBottom: 6 },
  btn: { backgroundColor: "#0ea5a4", padding: 14, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700" }
});
