import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getPin } from '../utils/authUtils';

const PinLoginScreen = ({ navigation }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [savedPin, setSavedPin] = useState('');

  useEffect(() => {
    const fetchPin = async () => {
      const pin = await getPin();
      if (pin) setSavedPin(pin);
    };
    fetchPin();
  }, []);

  const handleVerify = () => {
    if (enteredPin === savedPin) {
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Error', 'Incorrect PIN');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your PIN</Text>
      <TextInput
        style={styles.input}
        placeholder="****"
        secureTextEntry
        keyboardType="numeric"
        maxLength={4}
        value={enteredPin}
        onChangeText={setEnteredPin}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Unlock</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PinLoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 14,
    marginBottom: 16, borderRadius: 8, fontSize: 16, textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
