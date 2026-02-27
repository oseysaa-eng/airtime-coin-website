// src/screens/WithdrawSuccessScreen.tsx
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const WithdrawSuccessScreen = () => {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdrawal Submitted</Text>
      <Text style={styles.msg}>Your withdrawal request has been submitted and is being processed.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("Home" as never)}>
        <Text style={styles.btnText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WithdrawSuccessScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  msg: { textAlign: "center", color: "#666", marginBottom: 20 },
  btn: { backgroundColor: "#2b70ff", padding: 12, borderRadius: 8 },
  btnText: { color: "#fff", fontWeight: "700" },
});
