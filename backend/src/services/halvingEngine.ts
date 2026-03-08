import HalvingState from "../models/HalvingState";

const HALVING_INTERVAL_DAYS = 180;

export async function getHalvingReward(){

  let state = await HalvingState.findOne();

  if(!state){
    state = await HalvingState.create({});
  }

  const now = new Date();
  const last = new Date(state.lastHalving);

  const diffDays =
    (now.getTime() - last.getTime()) /
    (1000 * 60 * 60 * 24);

  if(diffDays >= HALVING_INTERVAL_DAYS){

    state.phase += 1;

    state.baseReward =
      Math.max(1, Math.floor(state.baseReward / 2));

    state.lastHalving = now;

    await state.save();
  }

  return state.baseReward;
}