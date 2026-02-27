import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function SettingsSection({
  title,
  children,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
    marginLeft: 6,
    color: "#334155",
  },
  card: {
    backgroundColor: "#f8fafb",
    borderRadius: 12,
    overflow: "hidden",
  },
});