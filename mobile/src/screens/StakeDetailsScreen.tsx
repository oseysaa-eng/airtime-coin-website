import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "StakeDetails">;

export default function StakeDetailsScreen({ route, navigation }: Props) {
  const { planId } = route.params;

  // Example plan - later replace with API call
  const plan = {
    id: planId,
    name: "ATC Staking Plan",
    rate: "12% Monthly",
    min: 50,
    max: 5000,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staking Plan</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Plan ID:</Text>
        <Text style={styles.value}>{plan.id}</Text>

        <Text style={styles.label}>Profit Rate:</Text>
        <Text style={styles.value}>{plan.rate}</Text>

        <Text style={styles.label}>Minimum Stake:</Text>
        <Text style={styles.value}>{plan.min} ATC</Text>

        <Text style={styles.label}>Maximum Stake:</Text>
        <Text style={styles.value}>{plan.max} ATC</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Staking")}
      >
        <Text style={styles.buttonText}>Stake Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  card: { borderWidth: 1, borderColor: "#ddd", padding: 20, borderRadius: 14 },
  label: { color: "#666", marginTop: 12 },
  value: { fontSize: 18, fontWeight: "600" },
  button: {
    marginTop: 40,
    backgroundColor: "#0ea5a4",
    padding: 15,
    borderRadius: 12,
  },
  buttonText: { textAlign: "center", fontSize: 18, fontWeight: "600", color: "#fff" },
});
