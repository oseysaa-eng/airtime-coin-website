import React from "react";
import {
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
};

export default function SettingsSwitchRow({
  icon,
  label,
  value,
  onChange,
}: Props) {
  return (
    <View style={styles.row}>
      {icon}

      <Text style={styles.label}>{label}</Text>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#ccc", true: "#0ea5a4" }}
        thumbColor="#fff"
        style={{ marginLeft: "auto" }}
      />
    </View>
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