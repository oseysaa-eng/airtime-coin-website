import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  device: any;
  current: boolean;
  onRemove: () => void;
};

export default function DeviceCard({
  device,
  current,
  onRemove,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Ionicons
          name={
            device.platform === "ios"
              ? "logo-apple"
              : "logo-android"
          }
          size={22}
          color="#0ea5a4"
        />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name}>
            {device.deviceName || "Unknown Device"}
          </Text>

          <Text style={styles.meta}>
            {device.platform?.toUpperCase()} ·{" "}
            {device.country || "Unknown"}
          </Text>

          <Text style={styles.time}>
            Last active:{" "}
            {new Date(device.lastSeen).toLocaleString()}
          </Text>
        </View>

        {current ? (
          <Text style={styles.current}>
            This device
          </Text>
        ) : (
          <TouchableOpacity
            onPress={onRemove}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color="red"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
    color: "#64748b",
  },
  time: {
    fontSize: 12,
    color: "#94a3b8",
  },
  current: {
    color: "#16a34a",
    fontSize: 12,
    fontWeight: "600",
  },
});