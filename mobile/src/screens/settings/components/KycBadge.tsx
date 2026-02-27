import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  status:
    | "verified"
    | "pending"
    | "rejected"
    | "not_submitted";
};

export default function KycBadge({ status }: Props) {
  const map: any = {
    verified: { label: "Verified", color: "#16a34a" },
    pending: { label: "Pending", color: "#f59e0b" },
    rejected: { label: "Rejected", color: "#dc2626" },
    not_submitted: {
      label: "Not submitted",
      color: "#64748b",
    },
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: map[status].color },
      ]}
    >
      <Text style={styles.text}>
        {map[status].label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: "auto",
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});