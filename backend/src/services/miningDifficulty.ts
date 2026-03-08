import EmissionState from "../models/EmissionState";

export async function getDynamicReward(){

  let state = await EmissionState.findOne();

  if(!state){
    state = await EmissionState.create({});
  }

  const mined = state.totalMinutesMined;

  let reward = 5;
  let phase = 0;

  if(mined > 20000000){
    reward = 1;
    phase = 4;
  }
  else if(mined > 10000000){
    reward = 2;
    phase = 3;
  }
  else if(mined > 5000000){
    reward = 3;
    phase = 2;
  }
  else if(mined > 1000000){
    reward = 4;
    phase = 1;
  }

  state.currentReward = reward;
  state.phase = phase;

  await state.save();

  return reward;
}