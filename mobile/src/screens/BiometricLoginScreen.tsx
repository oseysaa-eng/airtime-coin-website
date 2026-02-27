import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import API from '../api/api';
import { isBiometricSupported, promptBiometric } from '../hooks/useBiometric';

export default function BiometricLoginScreen({ navigation }: any) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    (async () => {
      setSupported(await isBiometricSupported());
    })();
  }, []);

  const handleBiometric = async () => {
    const ok = await promptBiometric();
    if (!ok) return Alert.alert('Failed', 'Biometric auth failed or cancelled');
    // retrieve saved token
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      // fallback: do local username/password flow
      return Alert.alert('No saved session', 'Please login normally first to enable biometrics.');
    }
    // Optionally verify token with backend
    try {
      const res = await API.get('/auth/verify'); // optional endpoint to verify token
      navigation.replace('MainTabs');
    } catch {
      Alert.alert('Session expired', 'Please login again');
      navigation.replace('Login');
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Biometric Login</Text>
      {supported ? (
        <TouchableOpacity style={s.button} onPress={handleBiometric}>
          <Text style={s.buttonText}>Use Face / Touch ID</Text>
        </TouchableOpacity>
      ) : (
        <Text>Biometric auth is not available on this device.</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' },
  title: { fontSize:20, fontWeight:'700', marginBottom:20 },
  button: { backgroundColor:'#0ea5a4', padding:14, borderRadius:8 },
  buttonText: { color:'#fff', fontWeight:'700' }
});
