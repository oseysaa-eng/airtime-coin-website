import EmissionState from "../models/EmissionState";

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
