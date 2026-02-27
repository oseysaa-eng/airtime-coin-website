import axios from "axios";
import { create } from "zustand";
import socket from "../services/socket";

const API = "http://192.168.1.217:5000/api";

type Store = {
  userId: string | null;

  kycStatus: string;
  hasPin: boolean;
  balance: number;

  setUser: (id: string) => void;

  fetchKyc: () => Promise<void>;
  fetchPin: () => Promise<void>;

  listenSocket: () => void;
};

export const useUserStore = create<Store>((set, get) => ({
  userId: null,

  kycStatus: "not_submitted",
  hasPin: false,
  balance: 0,

  setUser: (id) => {
    set({ userId: id });
    socket.emit("join", id);
  },

  fetchKyc: async () => {
    const id = get().userId;
    if (!id) return;

    const res = await axios.get(`${API}/kyc`, {});
    set({ kycStatus: res.data.kycStatus });
  },

  fetchPin: async () => {
    const res = await axios.get(`${API}/pin`);
    set({ hasPin: res.data.hasPin });
  },

  listenSocket: () => {
    socket.on("kyc:update", (data) => {
      set({ kycStatus: data.status });
    });

    socket.on("pin:update", (data) => {
      set({ hasPin: data.hasPin });
    });

    socket.on("balance:update", (data) => {
      set({ balance: data.balance });
    });

    socket.on("withdraw:update", (data) => {
      console.log("Withdraw Update:", data);
    });
  }
}));
