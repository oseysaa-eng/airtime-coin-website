import EmissionState from "../models/EmissionState";

export async function addMinedMinutes(minutes:number){

  let state = await EmissionState.findOne();

  if(!state){
    state = await EmissionState.create({});
  }

  state.totalMinutesMined += minutes;

  await state.save();

}