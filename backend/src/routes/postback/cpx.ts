import express from "express";
import TaskLog from "../../models/TaskLog";
import { creditUser } from "../../services/creditService";
import { verifySignature } from "../../utils/adSignature";
import { getGeo } from "../../utils/geo";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { user_id, task_id, amount, sig } = req.query as any;

    if (!user_id || !task_id || !amount || !sig) {
      return res.status(400).send("missing_params");
    }

    const raw = `${user_id}${task_id}${amount}`;
    if (!verifySignature(raw, sig, process.env.CPX_SECRET!)) {
      return res.status(403).send("invalid_signature");
    }

    const exists = await TaskLog.findOne({ taskId: task_id });
    if (exists) return res.send("duplicate");

    const ip =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress;

    const geo = getGeo(String(ip));

    await TaskLog.create({
      network: "CPX",
      userId: user_id,
      taskId: task_id,
      rewardMinutes: Number(amount),
      ip,
      country: geo.country,
    });

    await creditUser(
      req.app.get("io"),
      user_id,
      Number(amount),
      "OFFERWALL"
    );

    res.send("ok");
  } catch (e) {
    console.error("CPX ERROR:", e);
    res.status(500).send("error");
  }
});

export default router;
