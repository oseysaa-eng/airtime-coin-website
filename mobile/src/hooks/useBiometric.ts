import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export const isBiometricSupported = async () => {
  return await LocalAuthentication.hasHardwareAsync();
};

export const enrollBiometric = async () => {
  const saved = await AsyncStorage.getItem('biometricEnabled');
  if (saved === 'true') return true;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  if (!enrolled) throw new Error('No biometric enrolled on this device');
  await AsyncStorage.setItem('biometricEnabled', 'true');
  return true;
};

export const disableBiometric = async () => {
  await AsyncStorage.removeItem('biometricEnabled');
};

export const promptBiometric = async () => {
  const res = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to login',
    fallbackLabel: 'Use passcode',
  });
  return res.success;
};
