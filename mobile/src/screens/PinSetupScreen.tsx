import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  PinSetupScreen: undefined;
  Home: undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'PinSetup'>;
  route: RouteProp<RootStackParamList, 'PinSetup'>;
};

const PinSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSubmit = async () => {
    if (pin.length !== 4 || confirmPin.length !== 4) {
      Alert.alert('Invalid PIN', 'PIN must be exactly 4 digits.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Mismatch', 'PINs do not match.');
      return;
    }

    try {
      const hashed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin
      );
      await SecureStore.setItemAsync('userPIN', hashed);
      Alert.alert('PIN Set!', 'Your PIN has been securely saved.');
      navigation.navigate('Home'); // or navigate('Login') if you're enforcing PIN login
    } catch (error) {
      Alert.alert('Error', 'Failed to save PIN securely.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Your 4-digit PIN</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        value={pin}
        onChangeText={setPin}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm PIN"
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        value={confirmPin}
        onChangeText={setConfirmPin}
      />

      <TouchableOpacity onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Save PIN & Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PinSetupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
