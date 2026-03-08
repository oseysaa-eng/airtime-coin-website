import EmissionState from "../models/EmissionState";
import { getHalvingReward } from "./halvingEngine";

export async function getDynamicReward(){

  let state = await EmissionState.findOne();

  if(!state){
    state = await EmissionState.create({});
  }

  const mined = state.totalMinutesMined;

  const halvingReward =
    await getHalvingReward();

  let difficultyFactor = 1;

  if(mined > 20000000)
    difficultyFactor = 0.2;
  else if(mined > 10000000)
    difficultyFactor = 0.4;
  else if(mined > 5000000)
    difficultyFactor = 0.6;
  else if(mined > 1000000)
    difficultyFactor = 0.8;

  const finalReward =
    Math.max(1,
      Math.floor(
        halvingReward * difficultyFactor
      )
    );

  state.currentReward = finalReward;

  await state.save();

  return finalReward;
}