// src/services/atcSupplyService.ts
import ATCSupply from "../models/ATCSupply";

export async function mintATC(amount: number) {
  const supply =
    (await ATCSupply.findOne()) ||
    (await ATCSupply.create({}));

  if (supply.totalMinted + amount > supply.cap) {
    throw new Error("ATC supply cap exceeded");
  }

  supply.totalMinted += amount;
  await supply.save();

  return supply;
}
