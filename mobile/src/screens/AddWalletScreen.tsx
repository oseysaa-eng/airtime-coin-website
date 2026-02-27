import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AddWalletScreen = () => {
  const navigation = useNavigation();

  const [momoNumber, setMomoNumber] = useState('');
  const [walletType, setWalletType] = useState('MTN');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveWallet = () => {
    if (!momoNumber || !otp || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Mock saving logic
    Alert.alert('Wallet Added', `Wallet ${walletType} - ${momoNumber} saved`);
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Wallet</Text>

      <Text style={styles.label}>MoMo Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter MoMo number"
        keyboardType="phone-pad"
        value={momoNumber}
        onChangeText={setMomoNumber}
      />

      <Text style={styles.label}>Wallet Type</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={walletType}
          onValueChange={(itemValue) => setWalletType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="MTN" value="MTN" />
          <Picker.Item label="AirtelTigo" value="AirtelTigo" />
          <Picker.Item label="Telecel" value="Telecel" />
        </Picker>
      </View>

      <Text style={styles.label}>OTP Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter OTP sent to your number"
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
      />

      <Text style={styles.label}>Withdraw Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Set withdraw password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm withdraw password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveWallet}>
        <Ionicons name="wallet" size={20} color="#FFF" />
        <Text style={styles.saveButtonText}>Save Wallet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddWalletScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FAFAFA',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFF',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#5A55CA',
    padding: 16,
    borderRadius: 8,
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
});
