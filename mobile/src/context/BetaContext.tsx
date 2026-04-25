import React, { createContext, useContext } from "react";

type BetaSettings = {
  active: boolean;
  maxUsers?: number;

  showConversion: boolean;
  showWithdrawals: boolean;
  showAds: boolean;

  dailyAdLimit?: number;
  dailyMinutesCap?: number;
};

/* ✅ FULL DEFAULT (SAFE) */
const defaultBeta: BetaSettings = {
  active: false,
  maxUsers: undefined,

  showConversion: true,
  showWithdrawals: true,
  showAds: true,

  dailyAdLimit: undefined,
  dailyMinutesCap: undefined,
};

const BetaContext = createContext<BetaSettings>(defaultBeta);

export const BetaProvider = ({
  beta,
  children,
}: {
  beta: BetaSettings;
  children: React.ReactNode;
}) => {
  return (
    <BetaContext.Provider value={{ ...defaultBeta, ...beta }}>
      {children}
    </BetaContext.Provider>
  );
};

export const useBeta = () => useContext(BetaContext);