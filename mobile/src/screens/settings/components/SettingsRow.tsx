import { Feather } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

type Props = {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  danger?: boolean;
};

export default function SettingsRow({
  icon,
  label,
  onPress,
  danger,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.row}
      activeOpacity={0.7}
    >
      {icon}

      <Text
        style={[
          styles.label,
          danger && { color: "red" },
        ]}
      >
        {label}
      </Text>

      <Feather
        name="chevron-right"
        size={18}
        color="#94a3b8"
        style={{ marginLeft: "auto" }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  label: {
    fontSize: 16,
    marginLeft: 14,
    color: "#0f172a",
  },
});