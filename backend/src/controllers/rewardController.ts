import SystemSettings from "../models/SystemSettings";
import { creditReward } from "../services/rewardService";

export async function creditRewardController(req: any, res: any) {
  try {
    const settings = await SystemSettings.findOne();
    if (settings?.rewardsPaused) {
      return res.status(403).json({
        message: "Rewards temporarily disabled",
      });
    }

    const userId = req.user.id;
    const { source, minutes, meta } = req.body;

    const result = await creditReward({
      userId,
      source,
      minutes: Number(minutes),
      meta,
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({
      message: err.message || "Reward failed",
    });
  }
}
