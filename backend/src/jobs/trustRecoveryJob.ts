import UserTrust from "../models/UserTrust";
import { recoverTrust } from "../services/trustService";

export async function trustRecoveryJob() {
  const trusts = await UserTrust.find();

  for (const trust of trusts) {
    const hours =
      (Date.now() - trust.lastUpdated.getTime()) / 3600000;

    // 24h clean
    if (hours >= 24) {
      await recoverTrust(
        trust.userId,
        2,
        "24h clean behavior"
      );
    }
  }
}