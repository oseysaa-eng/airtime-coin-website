import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("userToken", token);
  } catch (err) {
    console.error("Error saving token", err);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch (err) {
    console.error("Error getting token", err);
    return null;
  }
};

export const savePin = async (pin: string) => {
  try {
    await AsyncStorage.setItem("userPin", pin);
  } catch (err) {
    console.error("Error saving PIN", err);
  }
};

export const getPin = async () => {
  try {
    return await AsyncStorage.getItem("userPin");
  } catch (err) {
    console.error("Error getting PIN", err);
    return null;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.multiRemove(["userToken", "userPin"]);
  } catch (err) {
    console.error("Error during logout", err);
  }
};
