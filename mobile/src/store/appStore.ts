import { create } from "zustand";

interface AppState {
  pinConfigured: boolean;
  kycStatus:string;

  setPinStatus:(v:boolean)=>void;
  setKycStatus:(v:string)=>void;
}

export const useAppStore = create<AppState>((set) => ({

  pinConfigured: false,
  kycStatus:"unverified",

  setPinStatus: v => set({ pinConfigured:v }),
  setKycStatus: v => set({ kycStatus:v }),

}));
