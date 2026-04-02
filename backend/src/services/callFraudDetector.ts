import CallSession from "../models/CallSession";
import FraudEvent from "../models/FraudEvent";

export const detectCallFarming = async (userId:any) => {
  

  const calls = await CallSession.find({
    userId,
    createdAt:{
      $gte:new Date(Date.now() - 10 * 60 * 1000)
    }
  });

  if(calls.length > 15){

    await FraudEvent.create({
      type:"CALL_FARMING",
      severity:"critical",
      userId,
      message:"Excessive call sessions detected"
    });

  }

};

