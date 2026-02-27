import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'userToken';

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};
const PIN_KEY = 'withdrawalPin';

export const saveWithdrawalPin = async (pin: string) => {
  await AsyncStorage.setItem(PIN_KEY, pin);
};

export const getWithdrawalPin = async () => {
  return await AsyncStorage.getItem(PIN_KEY);
};

export const clearWithdrawalPin = async () => {
  await AsyncStorage.removeItem(PIN_KEY);
};
