import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function UtilitySuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    utility,
    value,
    atcSpent,
    reference,
  } = route.params || {};

  return (
    <View style={s.container}>
      <Ionicons
        name="checkmark-circle"
        size={90}
        color="#0ea5a4"
      />

      <Text style={s.title}>Payment Successful</Text>

      <View style={s.card}>
        <Row label="Utility" value={utility} />
        <Row label="Value Received" value={`₵${value}`} />
        {atcSpent && (
          <Row
            label="ATC Spent"
            value={`${atcSpent} ATC`}
          />
        )}
        {reference && (
          <Row label="Reference" value={reference} />
        )}

        <Row
          label="Date"
          value={new Date().toLocaleString()}
        />
      </View>

      <TouchableOpacity
        style={s.btn}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          })
        }
      >
        <Text style={s.btnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#f8fafb",
    borderRadius: 14,
    padding: 18,
    marginBottom: 30,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: "#64748b",
  },

  value: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },

  btn: {
    backgroundColor: "#0ea5a4",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});