import React, { useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { addWallet } from "../../../api/walletApi";

export default function AddWalletModal({
  visible,
  onClose,
  onAdded,
}: any) {
  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= VALIDATION ================= */
  const validatePhone = (num: string) => {
    return /^0\d{9}$/.test(num); // Ghana format
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    if (!validatePhone(phone)) {
      return Alert.alert(
        "Invalid Number",
        "Enter a valid Ghana number (e.g. 024xxxxxxx)"
      );
    }

    try {
      setLoading(true);

      await addWallet({ network, phone });

      Alert.alert("Success", "Wallet added successfully");

      setPhone("");
      setNetwork("MTN");

      onAdded(); // reload wallets
      onClose();

    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to add wallet"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "#00000088",
        }}
      >
        <View
          style={{
            margin: 20,
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              marginBottom: 10,
            }}
          >
            Add Mobile Money Wallet
          </Text>

          {/* NETWORK SELECT */}
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            {["MTN", "AirtelTigo", "Telecel"].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setNetwork(n)}
                style={{
                  flex: 1,
                  padding: 10,
                  marginRight: 6,
                  backgroundColor: network === n ? "#0ea5a4" : "#eee",
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: network === n ? "#fff" : "#000",
                    fontWeight: "600",
                  }}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* PHONE INPUT */}
          <TextInput
            placeholder="Phone (024xxxxxxx)"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              padding: 14,
              marginTop: 16,
            }}
          />

          {/* SUBMIT */}
          <TouchableOpacity
            onPress={submit}
            disabled={loading}
            style={{
              backgroundColor: "#0ea5a4",
              padding: 16,
              borderRadius: 14,
              marginTop: 20,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                }}
              >
                Save Wallet
              </Text>
            )}
          </TouchableOpacity>

          {/* CANCEL */}
          <TouchableOpacity onPress={onClose} style={{ marginTop: 16 }}>
            <Text
              style={{
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}