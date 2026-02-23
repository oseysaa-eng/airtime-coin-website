import API from "./API";

export const getUserProfile = async () => {
  const res = await API.get("/user/profile");
  return res.data;
};

export const updateUserProfile = async (data: any) => {
  const res = await API.put("/user/update", data);
  return res.data;
};
