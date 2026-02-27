import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import API from "../api/api";

export default function ResetPasswordScreen({ navigation }: any) {

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasswordReset = async () => {
    setError("");

    if (!token.trim())
      return setError("Reset token required");

    if (!password || password.length < 6)
      return setError("Password must be at least 6 characters");

    try {
      setLoading(true);

      await API.post("/api/auth/reset-password", {
        token,
        password,
      });

      Alert.alert(
        "Password Updated ✅",
        "You can now login using your new password."
      );

      navigation.replace("Login");

    } catch (err: any) {
      setError(
        err?.response?.data?.msg || "Reset failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >

      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the token sent to your email and choose a new password.
        </Text>

        <TextInput
          placeholder="Reset token"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={token}
          onChangeText={setToken}
        />

        <View style={styles.passwordWrap}>
          <TextInput
            placeholder="New password"
            placeholderTextColor="#94a3b8"
            style={styles.passwordInput}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.btn}
          onPress={handlePasswordReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>
              Reset Password
            </Text>
          )}
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    padding: 24,
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
  },

  title: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
  },

  error: {
    color: "#ef4444",
    marginBottom: 12,
    fontSize: 12,
  },

  btn: {
    backgroundColor: "#0ea5a4",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});
