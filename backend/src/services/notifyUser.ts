import User from "../models/User";
import { sendPushToTokens } from "./pushService";

export const notifyUser = async (
  app: any,
  userId: string,
  title: string,
  body: string,
  data?: any,
  category: "earnings" | "fraud" | "promo" = "earnings"
) => {
  try {
    const io = app.get("io");

    const user = await User.findById(userId);
    if (!user) return;

    // 🚫 CATEGORY FILTER
    if (!user.notifications?.[category]) {
      console.log(`🔕 ${category} notifications disabled`);
      return;
    }

    // 🔌 SOCKET
    io?.to(`user:${userId}`).emit("notification", {
      title,
      body,
      category,
      data,
    });

    // 📲 PUSH
    const tokens = (user.pushTokens || []).slice(0, 100);
    if (!tokens.length) return;

    await sendPushToTokens(tokens, {
      notification: { title, body },
      data: { ...data, category },
    });

  } catch (err) {
    console.error("notifyUser error", err);
  }
};