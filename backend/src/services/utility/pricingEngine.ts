import Treasury from "../../models/Treasury";
import UtilityPool from "../../models/UtilityPool";
import UtilityPricing from "../../models/UtilityPricing";

export async function getUtilityRate() {
  const pricing =
    (await UtilityPricing.findOne()) ||
    (await UtilityPricing.create({}));

  const treasury =
    (await Treasury.findOne()) ||
    (await Treasury.create({}));

  const pool = await UtilityPool.findOne();

  const base = pricing.basePrice;

  // DEMAND
  const demandRatio =
    pool.dailyLimitATC > 0
      ? pool.spentTodayATC / pool.dailyLimitATC
      : 0;

  const demandMultiplier = 1 + demandRatio * 0.4;

  // SUPPLY
  const circulating =
    treasury.totalMintedATC - treasury.totalBurnedATC;

  const supplyRatio = circulating / treasury.maxSupply;

  const supplyMultiplier = 1 + supplyRatio * 0.3;

  // BURN PRESSURE
  const burnPressure =
    1 + treasury.burnedLast30Days / circulating;

  let rate =
    base *
    demandMultiplier *
    supplyMultiplier *
    burnPressure;

  // Clamp price
  rate = Math.max(pricing.minPrice, rate);
  rate = Math.min(pricing.maxPrice, rate);

  return Number(rate.toFixed(4));
}