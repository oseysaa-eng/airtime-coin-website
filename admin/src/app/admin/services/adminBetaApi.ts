import adminApi from "@/lib/adminApi";

export const getBetaSettings = async () => {
  const res = await adminApi.get("/admin/beta");
  return res.data;
};

export const updateBetaSettings = async (payload: any) => {
  const res = await adminApi.post("/admin/beta", payload);
  return res.data;
};

export const toggleEmergency = async (active: boolean, message = "") => {
  const res = await adminApi.post("/admin/beta/emergency", {
    active,
    message,
  });
  return res.data;
};