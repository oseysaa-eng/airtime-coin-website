import React, { useState } from "react";
import {
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { addWallet } from "../../../api/walletApi";

export default function AddWalletModal({
  visible,
  onClose,
  onAdded,
}: any) {
  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");

  const submit = async () => {
    await addWallet({ network, phone });
    onAdded();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ padding: 24 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "800",
          }}
        >
          Add Wallet
        </Text>

        <TextInput
          placeholder="Network (MTN / AT / Telecel)"
          value={network}
          onChangeText={setNetwork}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            marginTop: 20,
          }}
        />

        <TextInput
          placeholder="Phone number"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 14,
            marginTop: 12,
          }}
        />

        <TouchableOpacity
          onPress={submit}
          style={{
            backgroundColor: "#0ea5a4",
            padding: 16,
            borderRadius: 14,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            Save Wallet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClose}
          style={{ marginTop: 16 }}
        >
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
    </Modal>
  );
}