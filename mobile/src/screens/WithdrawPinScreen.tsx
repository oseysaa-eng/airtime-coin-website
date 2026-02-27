import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import API from "../api/api";
import { RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "WithdrawPin">;

export default function WithdrawPinScreen({ route, navigation }: Props) {
  const { withdrawId } = route.params;
  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newPin = [...pin];
    newPin[index] = text;
    setPin(newPin);

    if (text && index < 3) inputs.current[index + 1]?.focus();
  };

  const handleVerify = async () => {
    const finalPin = pin.join("");
    if (finalPin.length !== 4) {
      Alert.alert("Invalid PIN", "Please enter the 4-digit PIN.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/api/withdraw/verify-pin", {
        withdrawId,
        pin: finalPin,
      });

      Alert.alert("Success", "Withdrawal Approved!");
      navigation.navigate("Home");
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Withdrawal PIN</Text>
      <Text style={styles.subtitle}>To continue withdrawal, enter your security PIN.</Text>

      <View style={styles.pinContainer}>
        {pin.map((value, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.pinInput}
            keyboardType="number-pad"
            maxLength={1}
            secureTextEntry
            value={value}
            onChangeText={(text) => handleChange(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify PIN</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 30 },
  pinContainer: { flexDirection: "row", justifyContent: "center", gap: 15 },
  pinInput: {
    width: 55,
    height: 55,
    borderWidth: 2,
    borderColor: "#0ea5a4",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
  },
  button: {
    marginTop: 40,
    backgroundColor: "#0ea5a4",
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 18, fontWeight: "600" },
});
