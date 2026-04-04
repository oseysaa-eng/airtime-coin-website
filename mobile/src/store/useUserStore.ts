import { create } from "zustand";
import API from "../api/api";
import { getSocket, onSocketEvent } from "../services/socket";

type Store = {
  userId: string | null;

  kycStatus: string;
  hasPin: boolean;
  balance: number;

  setUser: (id: string) => Promise<void>;

  fetchKyc: () => Promise<void>;
  fetchPin: () => Promise<void>;

  listenSocket: () => Promise<() => void>;
};

export const useUserStore = create<Store>((set, get) => ({
  userId: null,

  kycStatus: "not_submitted",
  hasPin: false,
  balance: 0,

  /* =============================
     SET USER + SAFE SOCKET JOIN
  ============================= */
  setUser: async (id) => {
    set({ userId: id });

    const socket = await getSocket();

    if (socket) {
      if (socket.connected) {
        socket.emit("join", id);
      } else {
        socket.once("connect", () => {
          socket.emit("join", id);
        });
      }
    }
  },

  /* =============================
     FETCH KYC (TOKEN SAFE)
  ============================= */
  fetchKyc: async () => {
    try {
      const res = await API.get("/api/kyc");
      set({ kycStatus: res.data?.kycStatus || "not_submitted" });
    } catch (err: any) {
      console.log("⚠️ KYC fetch skipped:", err?.response?.status);
    }
  },

  /* =============================
     FETCH PIN (TOKEN SAFE)
  ============================= */
  fetchPin: async () => {
    try {
      const res = await API.get("/api/pin");
      set({ hasPin: res.data?.hasPin || false });
    } catch (err: any) {
      console.log("⚠️ PIN fetch skipped:", err?.response?.status);
    }
  },

  /* =============================
     SOCKET LISTENERS (GLOBAL)
  ============================= */
  listenSocket: async () => {
    const unsubscribers: (() => void)[] = [];

    console.log("🎧 Initializing socket listeners...");

    // 💰 REAL-TIME EARNINGS
    const offCredit = await onSocketEvent("MINUTES_CREDIT", (data) => {
      if (!data) return;

      console.log("💰 credit:", data);

      set((state) => ({
        balance: state.balance + (data.amount || 0),
      }));
    });

    unsubscribers.push(offCredit);

    // 🧾 KYC UPDATE
    const offKyc = await onSocketEvent("kyc:update", (data) => {
      if (!data) return;

      console.log("📡 KYC update:", data);

      set({ kycStatus: data.status });
    });

    unsubscribers.push(offKyc);

    // 🔐 PIN UPDATE
    const offPin = await onSocketEvent("pin:update", (data) => {
      if (!data) return;

      console.log("🔔 PIN update:", data);

      set({ hasPin: data.hasPin });
    });

    unsubscribers.push(offPin);

    // 💳 BALANCE SYNC (SERVER SOURCE OF TRUTH)
    const offBalance = await onSocketEvent("balance:update", (data) => {
      if (!data) return;

      console.log("🔄 Balance sync:", data);

      set({ balance: data.balance });
    });

    unsubscribers.push(offBalance);

    // 💸 WITHDRAW EVENTS
    const offWithdraw = await onSocketEvent("withdraw:update", (data) => {
      console.log("💸 Withdraw update:", data);
    });

    unsubscribers.push(offWithdraw);

    /* =============================
       CLEANUP
    ============================= */
    return () => {
      console.log("🧹 Cleaning socket listeners...");

      unsubscribers.forEach((fn) => fn && fn());
    };
  },
}));