import EmissionState from "../models/EmissionState";
import ConversionPool from "../models/ConversionPool";
import { EMISSION_CONFIG } from "../config/emission";

const HALVING_INTERVAL_DAYS = 180;

export async function runEmissionHalvingIfNeeded() {
  const emission =
    (await EmissionState.findOne()) ||
    (await EmissionState.create({
      phase: 0,
      multiplier: 1,
      lastHalvingAt: new Date(),
    }));

  const now = new Date();
  const daysSinceLast =
    (now.getTime() - emission.lastHalvingAt.getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysSinceLast < HALVING_INTERVAL_DAYS) {
    return emission; // ⛔ no halving yet
  }

  // 🔥 HALVING
  emission.phase += 1;
  emission.multiplier = Number((emission.multiplier / 2).toFixed(6));
  emission.lastHalvingAt = now;

  await emission.save();

  console.log(
    `🔥 EMISSION HALVING → Phase ${emission.phase}, multiplier=${emission.multiplier}`
  );

  return emission;
}


export const getDynamicRate = async () => {

  const pool = await ConversionPool.findOne({ source: "AIRTIME" });

  const emission =
    (await EmissionState.findOne()) ||
    (await EmissionState.create({}));

  let rate = emission.rate;

  if (!pool) return rate;

  const treasuryRatio = pool.balanceATC / pool.dailyLimitATC;

  if (treasuryRatio < EMISSION_CONFIG.treasuryProtectionThreshold) {

    rate = Math.max(
      rate * 0.8,
      EMISSION_CONFIG.minRate
    );

  } else {

    rate = Math.min(
      rate * 1.02,
      EMISSION_CONFIG.maxRate
    );

  }

  emission.rate = rate;

  await emission.save();

  return rate;

};
