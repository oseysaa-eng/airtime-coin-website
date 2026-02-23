import User from "../models/User";
import { sendPushToTokens } from "./pushService";

export const notifyUser = async (app: any, userId: string, title: string, body: string, data?: any) => {
  // socket emit
  try {
    const io = app.get("io");
    io?.to(`user:${userId}`).emit("notification", { title, body, data });

    // push
    const user = await User.findById(userId);
    if (!user) return;

    const tokens = (user.pushTokens || []).slice(0, 100);
    if (tokens.length === 0) return;

    const payload = {
      notification: { title, body },
      data: { ...data },
    };

    await sendPushToTokens(tokens, payload as any);
  } catch (err) {
    console.error("notifyUser error", err);
  }
};
