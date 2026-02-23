// src/services/emissionService.ts
import EmissionState from "../models/EmissionState";

export async function getEmissionMultiplier() {
  const state =
    (await EmissionState.findOne()) ||
    (await EmissionState.create({}));

  return state.multiplier;
}

export async function triggerHalving() {
  const state =
    (await EmissionState.findOne()) ||
    (await EmissionState.create({}));

  state.phase += 1;
  state.multiplier = Number((state.multiplier / 2).toFixed(6));
  state.lastHalvingAt = new Date();

  await state.save();
  return state;
}
