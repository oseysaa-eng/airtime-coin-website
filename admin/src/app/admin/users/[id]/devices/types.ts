export type Device = {
  _id: string;
  fingerprint: string;
  platform: string;
  deviceName: string;

  trusted: boolean;
  flagged: boolean;
  riskScore: number;

  loginCount: number;
  lastSeen: string;

  userId: {
    _id: string;
    email: string;
    name: string;
  };
};