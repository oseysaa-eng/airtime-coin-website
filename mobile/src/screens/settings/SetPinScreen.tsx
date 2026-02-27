import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SetPinScreen() {
  const navigation = useNavigation<any>();
  const [pin, setPin] = useState("");

  const next = () => {
    if (!/^\d{4}$/.test(pin)) {
      Alert.alert("PIN must be 4 digits");
      return;
    }

    navigation.navigate("ConfirmPin", { pin });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        Create PIN
      </Text>

      <TextInput
        placeholder="Enter 4-digit PIN"
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
        onPress={next}
        style={{
          marginTop: 30,
          backgroundColor: "#0ea5a4",
          padding: 16,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}