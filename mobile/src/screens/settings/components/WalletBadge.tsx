import React from "react";
import { Text, View } from "react-native";

export default function WalletBadge({
  label,
}: {
  label: string;
}) {
  return (
    <View
      style={{
        backgroundColor: "#e0f2fe",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
      }}
    >
      <Text
        style={{
          color: "#0284c7",
          fontSize: 11,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </View>
  );
}