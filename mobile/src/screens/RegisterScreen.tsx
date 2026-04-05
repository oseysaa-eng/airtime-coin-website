import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import API from "../api/api";

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const cleanEmail = email.trim();

    if (!username.trim()) {
      newErrors.username = "Username required";
    }

    if (!cleanEmail) {
      newErrors.email = "Email required";
    } else if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      newErrors.email = "Invalid email";
    }

    if (!password) {
      newErrors.password = "Password required";
    } else if (password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (loading) return;

    Keyboard.dismiss();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const res = await API.post("/api/auth/register", {
        email: email.trim().toLowerCase(),
        password,
        name: username.trim(),
        fullName: fullName.trim(),
        referralCode: referralCode.trim()
          ? referralCode.trim().toUpperCase()
          : undefined,
      });

      if (!res?.data?.token) {
        throw new Error("Registration failed");
      }

      Alert.alert("Success 🎉", "Account created successfully!");
      navigation.replace("Login");
    } catch (err: any) {
      console.log("REGISTER ERROR:", err);

      if (!err.response) {
        Alert.alert("Network Error", "Check your internet connection");
      } else {
        Alert.alert(
          "Registration Failed",
          err?.response?.data?.message ||
            err?.message ||
            "Unable to create account"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormIncomplete =
    !username.trim() || !email.trim() || !password || !acceptTerms;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Airtime Coin 🚀</Text>

            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Enter username"
              placeholderTextColor="#94a3b8"
              style={[styles.input, errors.username && styles.errorInput]}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.username ? (
              <Text style={styles.error}>{errors.username}</Text>
            ) : null}

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Enter full name"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              autoCorrect={false}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="example@gmail.com"
              placeholderTextColor="#94a3b8"
              style={[styles.input, errors.email && styles.errorInput]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            {errors.email ? (
              <Text style={styles.error}>{errors.email}</Text>
            ) : null}

            <Text style={styles.label}>Password</Text>
            <View
              style={[styles.passwordWrap, errors.password && styles.errorInput]}
            >
              <TextInput
                placeholder="Minimum 6 characters"
                placeholderTextColor="#94a3b8"
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.error}>{errors.password}</Text>
            ) : null}

            <Text style={styles.label}>Referral Code (Optional)</Text>
            <TextInput
              placeholder="Enter referral code"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checked]}>
                {acceptTerms ? (
                  <Feather name="check" size={14} color="#fff" />
                ) : null}
              </View>

              <Text style={styles.termsText}>
                I agree to the <Text style={styles.linkText}>Terms</Text> &{" "}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {errors.terms ? (
              <Text style={styles.error}>{errors.terms}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.btn,
                (loading || isFormIncomplete) && styles.disabledBtn,
              ]}
              onPress={handleRegister}
              disabled={loading || isFormIncomplete}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={styles.loginLink}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    elevation: 8,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    color: "#0f172a",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 24,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    color: "#334155",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#f8fafc",
    marginBottom: 10,
  },

  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#f8fafc",
    marginBottom: 10,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
  },

  errorInput: {
    borderColor: "#ef4444",
  },

  error: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 6,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 6,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  checked: {
    backgroundColor: "#0ea5a4",
    borderColor: "#0ea5a4",
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
  },

  linkText: {
    color: "#0ea5a4",
    fontWeight: "600",
  },

  btn: {
    backgroundColor: "#0ea5a4",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 10,
  },

  disabledBtn: {
    opacity: 0.5,
  },

  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  loginLink: {
    textAlign: "center",
    marginTop: 20,
    color: "#0ea5a4",
    fontWeight: "600",
  },
});