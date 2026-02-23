import API from "./API";

export const requestWithdraw = async (amount: number, momoNumber: string) => {
  const res = await API.post("/withdraw/request", {
    amount,
    momoNumber,
  });
  return res.data;
};

export const getWithdrawHistory = async () => {
  const res = await API.get("/withdraw/history");
  return res.data;
};
