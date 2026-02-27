export type RootStackParamList = {
  Home: undefined;

  // Withdraw flow
  Withdraw: undefined;
  WithdrawPin: { withdrawId: string };

  // Staking flow
  Staking: undefined;
  StakeDetails: { planId: string };

  // Auth
  Login: undefined;
  Register: undefined;

  // KYC
  KycStart: undefined;
  KycSubmit: undefined;

  // Profile
  Profile: undefined;
};
