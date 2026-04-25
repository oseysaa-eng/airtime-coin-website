import adminApi from "@/lib/adminApi";

/* =============================
   TYPES (MATCH BACKEND)
============================= */
export type BetaSettings = {
  active: boolean;
  maxUsers?: number;

  showConversion: boolean;
  showWithdrawals: boolean;
  showAds: boolean;

  dailyAdLimit?: number;
  dailyMinutesCap?: number;
};

export type BetaResponse = {
  success: boolean;
  beta: BetaSettings;
  incidentMode?: {
    active: boolean;
    message?: string;
  };
  isPublic?: boolean;
};

/* =============================
   GET SETTINGS
============================= */
export const getBetaSettings = async (): Promise<BetaResponse> => {
  try {
    const res = await adminApi.get("/admin/beta");
    return res.data;
  } catch (err: any) {
    console.error("❌ Failed to fetch beta settings", err?.message);
    throw new Error("Unable to load beta settings");
  }
};

/* =============================
   UPDATE SETTINGS
============================= */
export const updateBetaSettings = async (
  payload: Partial<BetaSettings>
): Promise<BetaResponse> => {
  try {
    const res = await adminApi.post("/admin/beta", payload);
    return res.data;
  } catch (err: any) {
    console.error("❌ Failed to update beta settings", err?.message);
    throw new Error("Failed to update settings");
  }
};

/* =============================
   EMERGENCY TOGGLE
============================= */
export const toggleEmergency = async (
  active: boolean,
  message = ""
): Promise<BetaResponse> => {
  try {
    const res = await adminApi.post("/admin/beta/emergency", {
      active,
      message,
    });
    return res.data;
  } catch (err: any) {
    console.error("❌ Emergency toggle failed", err?.message);
    throw new Error("Failed to toggle emergency mode");
  }
};