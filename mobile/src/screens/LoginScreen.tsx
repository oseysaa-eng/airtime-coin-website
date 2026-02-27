import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import API from "../api/api";
import { saveLoginData } from "../utils/authStorage";
import { getDeviceFingerprint } from "../utils/deviceFingerprint";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ LOAD BIOMETRIC + DEVICE FINGERPRINT
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);

      const fp = await getDeviceFingerprint();
      setFingerprint(fp);
    })();
  }, []);

  const theme = darkMode ? darkStyles : lightStyles;

  const validate = () => {
    setEmailError("");
    setPasswordError("");

    if (!email || !email.includes("@")) {
      setEmailError("Enter a valid email");
      return false;
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // ===============================
  // EMAIL LOGIN (PRIMARY)
  // ===============================
  const handleLogin = async () => {
    if (!validate()) return;

    if (!fingerprint) {
      Alert.alert("Device Error", "Unable to verify this device");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/api/auth/login", {
        email,
        password,
        fingerprint,
      });

      if (!res.data?.token) {
        throw new Error("Invalid login response");
      }

      await saveLoginData(res.data.token, res.data.user);

      navigation.replace("AppDrawer");
    } catch (err: any) {
      Alert.alert(
        "Login Failed",
        err?.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // BIOMETRIC LOGIN (TOKEN ONLY)
  // ===============================
  const handleBiometricAuth = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate",
    });

    if (!result.success) return;

    // 🔐 biometric only unlocks stored token
    navigation.replace("AppDrawer");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={theme.container}>

        {/* THEME */}
        <View style={theme.toggleRow}>
          <Ionicons
            name={darkMode ? "moon" : "sunny"}
            size={20}
            color={theme.toggleIcon.color}
          />
          <Switch value={darkMode} onValueChange={() => setDarkMode(!darkMode)} />
        </View>

        <Text style={theme.title}>Welcome Back 👋</Text>
        <Text style={theme.subtitle}>
          Login to continue earning with Airtime Coin
        </Text>

        <TextInput
          style={[theme.input, emailError && { borderColor: "#ef4444" }]}
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {emailError ? <Text style={theme.errorText}>{emailError}</Text> : null}

        <View style={theme.passwordWrapper}>
          <TextInput
            style={[theme.passwordInput, passwordError && { borderColor: "#ef4444" }]}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={theme.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} />
          </TouchableOpacity>
        </View>

        {passwordError ? (
          <Text style={theme.errorText}>{passwordError}</Text>
        ) : null}

        <TouchableOpacity
          style={[theme.loginButton, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={theme.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        {biometricAvailable && (
          <TouchableOpacity
            onPress={handleBiometricAuth}
            style={theme.biometricButton}
          >
            <Ionicons name="finger-print" size={32} color="#0ea5a4" />
            <Text style={theme.biometricText}>Login with Biometrics</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ===================== */
/*       STYLES         */
/* ===================== */

const lightStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
    alignItems: "center",
  },

  toggleIcon: {
    color: "#4b5563",
    marginRight: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#0f172a",
  },

  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    color: "#64748b",
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    borderRadius: 14,
    marginBottom: 6,
    fontSize: 15,
  },

  passwordWrapper: {
    position: "relative",
    marginBottom: 6,
  },

  passwordInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    paddingRight: 48,
    borderRadius: 14,
    fontSize: 15,
  },

  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 14,
  },

  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },

  loginButton: {
    backgroundColor: "#0ea5a4",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 22,
  },

  loginText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  biometricButton: {
    alignItems: "center",
    marginBottom: 22,
  },

  biometricIcon: {
    color: "#0ea5a4",
  },

  biometricText: {
    marginTop: 6,
    color: "#0ea5a4",
    fontSize: 14,
    fontWeight: "600",
  },

  switchText: {
    textAlign: "center",
    color: "#334155",
    fontSize: 14,
  },
});

const darkStyles = StyleSheet.create({
  ...lightStyles,

  container: {
    ...lightStyles.container,
    backgroundColor: "#020617",
  },

  title: {
    ...lightStyles.title,
    color: "#fff",
  },

  subtitle: {
    ...lightStyles.subtitle,
    color: "#94a3b8",
  },

  input: {
    ...lightStyles.input,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    color: "#fff",
  },

  passwordInput: {
    ...lightStyles.passwordInput,
    backgroundColor: "#0f172a",
    borderColor: "#1e293b",
    color: "#fff",
  },

  biometricIcon: {
    color: "#38bdf8",
  },

  biometricText: {
    color: "#38bdf8",
  },
});
