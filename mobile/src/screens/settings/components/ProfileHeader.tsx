import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  name: string;
  userId: string;
};

export default function ProfileHeader({
  name,
  userId,
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="person-circle-outline"
        size={60}
        color="#0ea5a4"
      />

      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.id}>User ID: {userId}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  id: {
    fontSize: 12,
    color: "#666",
  },
});