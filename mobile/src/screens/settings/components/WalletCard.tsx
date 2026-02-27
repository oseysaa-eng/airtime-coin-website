import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import WalletBadge from "./WalletBadge";

export default function WalletCard({
  wallet,
  onSetDefault,
  onDelete,
}: any) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.network}>
          {wallet.network}
        </Text>

        {wallet.isDefault && (
          <WalletBadge label="Default" />
        )}
      </View>

      <Text style={styles.phone}>
        {wallet.phone}
      </Text>

      <View style={styles.actions}>
        {!wallet.isDefault && (
          <TouchableOpacity
            onPress={onSetDefault}
          >
            <Text style={styles.link}>
              Set default
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.danger}>
            Remove
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  network: {
    fontWeight: "700",
    fontSize: 16,
  },
  phone: {
    color: "#64748b",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    marginTop: 14,
    gap: 20,
  },
  link: {
    color: "#0ea5a4",
    fontWeight: "600",
  },
  danger: {
    color: "#dc2626",
    fontWeight: "600",
  },
});