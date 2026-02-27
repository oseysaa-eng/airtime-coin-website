import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveLoginData = async (token: string, user: any) => {
  await AsyncStorage.setItem("userToken", token);
  await AsyncStorage.setItem("userId", user._id);
};

export const clearLoginData = async () => {
  await AsyncStorage.multiRemove(["userToken", "userId"]);
};
