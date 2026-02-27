// src/components/KycGuard.tsx
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import API from "../api/api";

export default function KycGuard({ children }: any) {
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/api/kyc/status");
        setKycStatus(res.data.kycStatus);
        if (res.data.kycStatus !== "approved" && res.data.kycStatus !== "verified" && res.data.kycStatus !== "approved") {
          setShowModal(true);
        }
      } catch (err) {
        setShowModal(true);
      }
    })();
  }, []);

  if (showModal) {
    return (
      <View style={styles.center}>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>KYC Required</Text>
        <Text style={{ color: "#666", marginBottom: 12 }}>You must complete identity verification to use this feature.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => { /* navigate to KYC */ }}>
          <Text style={{ color: "#fff" }}>Verify Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  btn: { backgroundColor: "#0ea5a4", padding: 12, borderRadius: 8 }
});
