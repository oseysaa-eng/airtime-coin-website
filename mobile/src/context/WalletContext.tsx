import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    connectSocket,
    getSocket,
} from "../services/socket";

type Wallet = {
  balance: number;
  atc: number;
  minutes: number;
};

type WalletContextType = {
  wallet: Wallet;
};

const WalletContext = createContext<WalletContextType | null>(
  null
);

export function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wallet, setWallet] = useState<Wallet>({
    balance: 0,
    atc: 0,
    minutes: 0,
  });

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await connectSocket();
      const socket = getSocket();

      if (!socket) return;

      socket.on("WALLET_UPDATE", data => {
        if (!mounted) return;

        setWallet({
          balance: data.balance ?? 0,
          atc: data.atc ?? 0,
          minutes: data.minutes ?? 0,
        });
      });
    };

    init();

    return () => {
      mounted = false;
      const socket = getSocket();
      socket?.off("WALLET_UPDATE");
    };
  }, []);

  return (
    <WalletContext.Provider value={{ wallet }}>
      {children}
    </WalletContext.Provider>
  );
}

/* =====================================
   HOOK
===================================== */

export const useWallet = () => {
  const ctx = useContext(WalletContext);

  if (!ctx) {
    throw new Error(
      "useWallet must be used inside WalletProvider"
    );
  }

  return ctx;
};