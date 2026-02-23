import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "./API";

export const registerUser = async (data: any) => {
  const res = await API.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data: any) => {
  const res = await API.post("/auth/login", data);

  if (res.data?.token) {
    await AsyncStorage.setItem("userToken", res.data.token);
  }

  return res.data;
};

export const uploadKYC = async (formData: FormData) => {
  const res = await API.post("/kyc/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const logoutUser = async () => {
  await AsyncStorage.removeItem("userToken");
};
