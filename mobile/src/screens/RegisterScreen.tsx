import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
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

  // ===============================
  // VALIDATION
  // ===============================
  const validateForm = () => {

  let newErrors: any = {};

  if (!username.trim())
    newErrors.username = "Username required";

  if (!email.trim())
    newErrors.email = "Email required";

  else if (!/\S+@\S+\.\S+/.test(email))
    newErrors.email = "Invalid email";

  if (!password)
    newErrors.password = "Password required";

  else if (password.length < 6)
    newErrors.password = "Minimum 6 characters";

  if (!referralCode.trim())
    newErrors.referralCode = "Invite code required";

  if (!acceptTerms)
    newErrors.terms = "Accept Terms required";

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};


  // ===============================
  // REGISTER
  // ===============================


const handleRegister = async () => {
  Keyboard.dismiss();

  if (!validateForm()) return;

  try {
    setLoading(true);

    const res = await API.post("/auth/register", {

      email: email.trim().toLowerCase(),

      password,

      name: username.trim(),

      fullName: fullName.trim(),

      referralCode: referralCode || null,

      inviteCode: referralCode || null, // REQUIRED FOR PRIVATE BETA

    });

    if (!res?.data?.token) {
      throw new Error("Registration failed");
    }

    Alert.alert(
      "Success 🎉",
      "Account created successfully!"
    );

    navigation.replace("Login");

  } catch (err: any) {

    console.log("REGISTER ERROR:", err?.response?.data);

    Alert.alert(
      "Registration Failed",
      err?.response?.data?.message ||
      err?.response?.data?.msg ||
      err?.message ||
      "Unable to create account"
    );

  } finally {
    setLoading(false);
  }
};

  // ===============================
  // UI
  // ===============================
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.card}>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Airtime Coin today 🚀
          </Text>

          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <TextInput
            placeholder="Enter username"
            placeholderTextColor="#94a3b8"
            style={[
              styles.input,
              errors.username && styles.errorInput
            ]}
            value={username}
            onChangeText={setUsername}
          />
          {errors.username && (
            <Text style={styles.error}>{errors.username}</Text>
          )}

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder="Enter your full name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="example@gmail.com"
            placeholderTextColor="#94a3b8"
            style={[
              styles.input,
              errors.email && styles.errorInput
            ]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && (
            <Text style={styles.error}>{errors.email}</Text>
          )}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[
            styles.passwordWrap,
            errors.password && styles.errorInput
          ]}>
            <TextInput
              placeholder="Create a strong password"
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
          {errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}

          {/* Referral Code */}
          <Text style={styles.label}>Invite Code</Text>

            <TextInput
              placeholder="Enter your invite code"
              placeholderTextColor="#94a3b8"
              style={[
                styles.input,
                errors.referralCode && styles.errorInput
              ]}
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="none"
            />

            {errors.referralCode && (
              <Text style={styles.error}>
                {errors.referralCode}
              </Text>
            )}
  
        
          {/* TERMS */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAcceptTerms(!acceptTerms)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.checkbox,
              acceptTerms && styles.checked
            ]}>
              {acceptTerms && (
                <Feather
                  name="check"
                  size={14}
                  color="#fff"
                />
              )}
            </View>

            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.termsLink}>
                Terms
              </Text>{" "}
              &{" "}
              <Text style={styles.termsLink}>
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>

          {errors.terms && (
            <Text style={styles.error}>{errors.terms}</Text>
          )}

          {/* CREATE ACCOUNT BUTTON */}
          <TouchableOpacity
            style={[
              styles.btn,
              (loading || !acceptTerms) && styles.disabledBtn
            ]}
            onPress={handleRegister}
            disabled={loading || !acceptTerms}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <TouchableOpacity
            onPress={() => navigation.replace("Login")}
          >
            <Text style={styles.link}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

/* ===============================
   STYLES
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    elevation: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#0f172a",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 28,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
    marginLeft: 2,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
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

  errorInput: {
    borderColor: "#ef4444",
  },

  error: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },

  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#94a3b8",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  checked: {
    backgroundColor: "#0ea5a4",
    borderColor: "#0ea5a4",
  },

  termsText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },

  termsLink: {
    color: "#0ea5a4",
    fontWeight: "600",
  },

  btn: {
    backgroundColor: "#0ea5a4",
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 12,
  },

  disabledBtn: {
    opacity: 0.5,
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#0ea5a4",
    fontWeight: "600",
  },
});
