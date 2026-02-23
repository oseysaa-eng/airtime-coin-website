import ATCPrice from "../models/ATCPrice";
import ATCPriceHistory from "../models/ATCPriceHistory";
import ConversionPool from "../models/ConversionPool";
import Transaction from "../models/Transaction";
import Treasury from "../models/Treasury";
import UtilityPool from "../models/UtilityPool";

const BASE_PRICE = 0.0025;
const MIN_PRICE = 0.001;
const MAX_PRICE = 0.02;

const clamp = (min: number, max: number, value: number) =>
  Math.min(max, Math.max(min, value));

export async function calculateATCPrice() {
  // 🔍 Load live price config
  const live = await ATCPrice.findOne();

  /**
   * 🧊 FROZEN MODE
   */
  if (live?.mode === "FROZEN") {
    console.log("🧊 ATC price frozen:", live.currentPrice);
    return live.currentPrice;
  }

  /**
   * ✋ MANUAL MODE
   */
  if (live?.mode === "MANUAL" && live.manualPrice) {
    const previous = live.currentPrice || live.manualPrice;

    const trend =
      live.manualPrice > previous
        ? "up"
        : live.manualPrice < previous
        ? "down"
        : "flat";

    await ATCPrice.findOneAndUpdate(
      {},
      {
        previousPrice: previous,
        currentPrice: live.manualPrice,
        changePercent:
          previous === 0
            ? 0
            : ((live.manualPrice - previous) / previous) * 100,
        trend,
        updatedAt: new Date(),
      },
      { upsert: true }
    );

    console.log("✋ ATC manual price:", live.manualPrice);
    return live.manualPrice;
  }

  /**
   * ⚙️ AUTO MODE
   */
  const pool = await ConversionPool.findOne();
  const treasury = await Treasury.findOne();
  const utilityPools = await UtilityPool.find();

  if (!pool || !treasury) {
    console.warn("Pricing skipped — missing pools");
    return live?.currentPrice || BASE_PRICE;
  }

  // 🕛 Today window
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 📊 Daily conversions
  const conversions = await Transaction.aggregate([
    {
      $match: {
        type: "CONVERT",
        createdAt: { $gte: today },
      },
    },
    {
      $group: {
        _id: null,
        minutes: { $sum: "$meta.minutes" },
      },
    },
  ]);

  const utilities = await Transaction.aggregate([
    {
      $match: {
        type: "UTILITY",
        createdAt: { $gte: today },
      },
    },
    {
      $group: {
        _id: null,
        atc: { $sum: "$amount" },
      },
    },
  ]);

  const todayMinutes = conversions[0]?.minutes || 0;
  const utilityATC = utilities[0]?.atc || 0;

  // 📈 Multipliers
  const demandMultiplier = clamp(
    0.9,
    1.4,
    1 + (todayMinutes / 100_000) * 0.15
  );

  const utilityMultiplier = clamp(
    1.0,
    1.5,
    1 + (utilityATC / pool.dailyLimitATC) * 0.25
  );

  const burnMultiplier = clamp(
    1.0,
    1.3,
    1 + treasury.totalBurnedATC / 1_000_000
  );

  const liquidityMultiplier = clamp(
    0.7,
    1.2,
    pool.balanceATC / pool.initialBalanceATC
  );

  // 💰 Price calculation
  const rawPrice =
    BASE_PRICE *
    demandMultiplier *
    utilityMultiplier *
    burnMultiplier *
    liquidityMultiplier;

  const finalPrice = clamp(MIN_PRICE, MAX_PRICE, rawPrice);

  const previousPrice = live?.currentPrice || finalPrice;

  const changePercent =
    previousPrice === 0
      ? 0
      : ((finalPrice - previousPrice) / previousPrice) * 100;

  const trend =
    finalPrice > previousPrice
      ? "up"
      : finalPrice < previousPrice
      ? "down"
      : "flat";

  // 💾 SAVE LIVE PRICE
  await ATCPrice.findOneAndUpdate(
    {},
    {
      currentPrice: finalPrice,
      previousPrice,
      changePercent,
      trend,
      breakdown: {
        demand: demandMultiplier,
        utility: utilityMultiplier,
        burn: burnMultiplier,
        liquidity: liquidityMultiplier,
      },
      updatedAt: new Date(),
    },
    { upsert: true }
  );

  // 📚 HISTORY SNAPSHOT
  await ATCPriceHistory.create({
    price: finalPrice,
  });

  console.log(
    `📈 ATC PRICE → ${finalPrice.toFixed(6)} (${trend})`
  );

  return finalPrice;
}