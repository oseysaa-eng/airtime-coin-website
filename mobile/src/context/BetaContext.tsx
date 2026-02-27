import React, { createContext, useContext } from "react";

type BetaState = {
  active: boolean;
  conversionEnabled: boolean;
  withdrawalEnabled: boolean;
};

const BetaContext = createContext<BetaState>({
  active: false,
  conversionEnabled: true,
  withdrawalEnabled: true,
});

export const BetaProvider = ({
  beta,
  children,
}: {
  beta: BetaState;
  children: React.ReactNode;
}) => {
  return (
    <BetaContext.Provider value={beta}>
      {children}
    </BetaContext.Provider>
  );
};

export const useBeta = () => useContext(BetaContext);