import mongoose from "mongoose";

import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";

export async function rewardEngine({
  userId,
  minutes,
  source,
  meta = {},
  io
}:any){

  const session = await mongoose.startSession();
  session.startTransaction();

  try{

    const wallet =
      (await Wallet.findOne({userId})) ||
      (await Wallet.create({userId}));

    wallet.totalMinutes += minutes;
    wallet.todayMinutes += minutes;

    await wallet.save({session});

    await Transaction.create([{
      userId,
      type:"EARN",
      amount:minutes,
      source,
      meta
    }],{session});

    await session.commitTransaction();
    session.endSession();

    if(io)
      io.to(userId.toString())
        .emit("wallet:update",{
          totalMinutes:wallet.totalMinutes,
          todayMinutes:wallet.todayMinutes
        });

    return true;

  }catch(err){

    await session.abortTransaction();
    session.endSession();

    throw err;

  }

}