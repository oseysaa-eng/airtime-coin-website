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

export default function ForgotPasswordScreen({ navigation }: any) {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetRequest = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/api/auth/forgot-password", { email });

      Alert.alert(
        "Check your email 📧",
        "We’ve sent password reset instructions to your email."
      );

      navigation.navigate("ResetPassword");

    } catch (err: any) {
      setError(
        err?.response?.data?.msg || "Failed to send reset email"
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
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we will help you reset your password.
        </Text>

        <TextInput
          placeholder="example@email.com"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleResetRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Send Reset Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.link}>
            Back to login
          </Text>
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
    marginBottom: 8,
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 24,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#f8fafc",
    marginBottom: 10,
  },

  error: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 12,
  },

  btn: {
    marginTop: 10,
    backgroundColor: "#0ea5a4",
    paddingVertical: 16,
    borderRadius: 16,
  },

  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#0ea5a4",
    fontWeight: "600",
  },
});
