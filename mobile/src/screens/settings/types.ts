export type KycStatus =
  | "verified"
  | "pending"
  | "rejected"
  | "not_submitted";

export type SettingsState = {
  biometricEnabled: boolean;
  notificationsEnabled: boolean;
  kycStatus: KycStatus;
  userName: string;
  userId: string;
};