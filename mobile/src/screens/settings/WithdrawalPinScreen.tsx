import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function WithdrawalPinScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        Transaction PIN
      </Text>

      <Text style={{ marginTop: 10, color: "#666" }}>
        Your PIN is required to authorize all withdrawals and
        utility payments.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("SetPin")}
        style={{
          marginTop: 40,
          backgroundColor: "#0ea5a4",
          padding: 16,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "#fff",
            fontWeight: "700",
          }}
        >
          Set / Change PIN
        </Text>
      </TouchableOpacity>
    </View>
  );
}