import mongoose from "mongoose";
import Wallet from "../models/Wallet";
import Transaction from "../models/Transaction";
import { applyTrustPenalty } from "./trustEngine";

export const processWithdrawal = async ({
  userId,
  amount,
}: {
  userId: string;
  amount: number;
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOne({ userId }).session(session);

    if (!wallet) throw new Error("Wallet not found");

    if (wallet.balanceATC < amount) {
      throw new Error("Insufficient balance");
    }

    /* ================= FRAUD CHECK ================= */
    if (amount > wallet.balanceATC * 0.8) {
      await applyTrustPenalty({
        userId,
        type: "LARGE_WITHDRAWAL",
        meta: { amount },
      });
    }

    /* ================= UPDATE ================= */
    wallet.balanceATC -= amount;
    await wallet.save({ session });

    await Transaction.create(
      [
        {
          userId,
          type: "WITHDRAW",
          amount,
          status: "PENDING",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      amount,
    };

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    throw err;
  }
};