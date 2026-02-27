import API from "./api";

export const getWallets = () =>
  API.get("/api/wallet");

export const addWallet = (data: {
  network: string;
  phone: string;
}) =>
  API.post("/api/wallet/add", data);

export const removeWallet = (id: string) =>
  API.delete(`/api/wallet/${id}`);

export const setDefaultWallet = (id: string) =>
  API.post("/api/wallet/default", { id });