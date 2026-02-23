import API from "./API";

export const getUserEarnings = async () => {
  const res = await API.get("/earn/balance");
  return res.data;
};

export const getEarningHistory = async () => {
  const res = await API.get("/earn/history");
  return res.data;
};

export const claimEarnings = async () => {
  const res = await API.post("/earn/claim");
  return res.data;
};
