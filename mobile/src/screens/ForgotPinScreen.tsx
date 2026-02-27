import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ForgotPinScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleSendReset = async () => {
    // In production, send OTP to user's verified email/phone
    if (!email) {
      Alert.alert('Enter email');
      return;
    }

    Alert.alert('OTP Sent', 'A reset OTP was sent to your email (mock)');
    navigation.navigate('ResetPinVerifyOtp', { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot PIN</Text>
      <TextInput
        placeholder="Enter your email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TouchableOpacity onPress={handleSendReset} style={styles.button}>
        <Text style={styles.buttonText}>Send Reset OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPinScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 20 },
  button: { backgroundColor: '#007bff', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
