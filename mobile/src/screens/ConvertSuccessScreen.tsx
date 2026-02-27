import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function ConvertSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const airtime = route.params?.airtime || 0;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>
        ✅ Success
      </Text>

      <Text style={{ marginTop: 12, fontSize: 16 }}>
        Airtime credited:
      </Text>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginTop: 8,
        }}
      >
        {airtime}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        style={{
          marginTop: 30,
          padding: 14,
          borderRadius: 8,
          backgroundColor: "#0ea5a4",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Back to Home
        </Text>
      </TouchableOpacity>
    </View>
  );
}