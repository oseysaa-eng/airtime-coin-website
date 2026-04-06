import { DAILY_LIMITS } from "../config/limits";
import Transaction from "../models/Transaction";
import Wallet from "../models/Wallet";
import { resetDailyIfNeeded } from "../utils/resetDaily";
import mongoose from "mongoose";

export const creditUser = async (
  userId: string,
  minutes: number,
  source: "ADS" | "CALL" | "SURVEY",
  mongoSession?: mongoose.ClientSession
) => {
  const session = mongoSession || (await mongoose.startSession());

  try {
    if (!mongoSession) session.startTransaction();

    /* ================= LOCK WALLET ================= */
    const wallet = await Wallet.findOne({ userId }).session(session);

    if (!wallet) throw new Error("Wallet not found");

    /* ================= RESET DAILY ================= */
    resetDailyIfNeeded(wallet);

    /* ================= LIMIT CHECK ================= */

    if (
      source === "ADS" &&
      wallet.dailyEarned.ads + minutes > DAILY_LIMITS.adsMinutes
    ) {
      throw new Error("Daily ad limit reached");
    }

    if (
      source === "CALL" &&
      wallet.dailyEarned.calls + minutes > DAILY_LIMITS.callMinutes
    ) {
      throw new Error("Daily call limit reached");
    }

    if (
      source === "SURVEY" &&
      wallet.dailyEarned.surveys + minutes > DAILY_LIMITS.surveyMinutes
    ) {
      throw new Error("Daily survey limit reached");
    }

    if (wallet.todayMinutes + minutes > DAILY_LIMITS.totalMinutes) {
      throw new Error("Daily total limit reached");
    }

    /* ================= APPLY ================= */

    wallet.totalMinutes += minutes;
    wallet.todayMinutes += minutes;

    if (source === "ADS") wallet.dailyEarned.ads += minutes;
    if (source === "CALL") wallet.dailyEarned.calls += minutes;
    if (source === "SURVEY") wallet.dailyEarned.surveys += minutes;

    wallet.lastEarningAt = new Date();

    await wallet.save({ session });

    /* ================= TRANSACTION LOG ================= */
    await Transaction.create(
      [
        {
          userId,
          type: "EARN",
          amount: minutes,
          source,
          status: "SUCCESS",
        },
      ],
      { session }
    );

    if (!mongoSession) {
      await session.commitTransaction();
    }

    /* ================= RETURN (REALTIME READY) ================= */
    return {
      success: true,
      minutes,
      balance: wallet.balanceATC || 0,
      atc: wallet.balanceATC || 0,
      totalMinutes: wallet.totalMinutes,
      todayMinutes: wallet.todayMinutes,
    };

  } catch (err) {
    if (!mongoSession) {
      await session.abortTransaction();
    }

    throw err;

  } finally {
    if (!mongoSession) {
      session.endSession();
    }
  }
};