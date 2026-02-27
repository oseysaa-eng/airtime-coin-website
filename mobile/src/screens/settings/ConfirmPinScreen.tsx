import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import API from "../../api/api";

export default function ConfirmPinScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const originalPin = route.params.pin;
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const savePin = async () => {
    if (pin !== originalPin) {
      Alert.alert("PIN does not match");
      return;
    }

    setLoading(true);

    try {
      await API.post("/api/user/set-pin", { pin });

      Alert.alert("Success", "Transaction PIN set");
      navigation.popToTop();
    } catch (e: any) {
      Alert.alert(
        "Failed",
        e.response?.data?.message || "Try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        Confirm PIN
      </Text>

      <TextInput
        placeholder="Confirm PIN"
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
        style={{
          borderWidth: 1,
          padding: 16,
          marginTop: 30,
          borderRadius: 10,
        }}
      />

      <TouchableOpacity
        onPress={savePin}
        disabled={loading}
        style={{
          marginTop: 30,
          backgroundColor: "#0ea5a4",
          padding: 16,
          borderRadius: 10,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {loading ? "Saving..." : "Confirm PIN"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}