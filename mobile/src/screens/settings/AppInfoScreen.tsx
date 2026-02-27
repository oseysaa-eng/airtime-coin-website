import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getAppInfo } from "../../utils/appInfo";

export default function AppInfoScreen() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    getAppInfo().then(setInfo);
  }, []);

  if (!info) return null;

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Information</Text>

      <Row label="App Name" value={info.appName} />
      <Row label="Version" value={info.version} />
      <Row label="Build" value={info.build} />
      <Row label="Package" value={info.packageName} />

      <View style={styles.divider} />

      <Row label="Device" value={info.model} />
      <Row label="OS" value={`${info.osName} ${info.osVersion}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  label: {
    color: "#64748b",
    fontSize: 14,
  },
  value: {
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    height: 20,
  },
});