import mongoose from "mongoose";

import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";

import {
  pushWalletUpdate,
  pushMinutes,
} from "../sockets/socket";

export async function rewardEngine({
  userId,
  minutes,
  source,
  meta = {},
}: any) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    /* ================= GET OR CREATE WALLET ================= */
    let wallet = await Wallet.findOne({ userId }).session(session);

    if (!wallet) {
      wallet = await Wallet.create(
        [
          {
            userId,
            totalMinutes: 0,
            todayMinutes: 0,
          },
        ],
        { session }
      ).then((res) => res[0]);
    }

    /* ================= UPDATE WALLET ================= */
    wallet.totalMinutes += minutes;
    wallet.todayMinutes += minutes;

    await wallet.save({ session });

    /* ================= CREATE TRANSACTION ================= */
    await Transaction.create(
      [
        {
          userId,
          type: "EARN",
          amount: minutes,
          source,
          meta,
        },
      ],
      { session }
    );

    /* ================= COMMIT ================= */
    await session.commitTransaction();
    session.endSession();

    /* ================= 🔥 REAL-TIME PUSH ================= */

    // ✅ Full wallet update
    pushWalletUpdate(userId.toString(), {
      totalMinutes: wallet.totalMinutes,
      todayMinutes: wallet.todayMinutes,
      balance: wallet.balanceATC || 0,
      source,
    });

    // ✅ Animation / quick feedback
    pushMinutes(userId.toString(), minutes, {
      source,
    });

    return true;

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("❌ REWARD ENGINE ERROR:", err);

    throw err;
  }
}