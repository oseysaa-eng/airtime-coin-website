export const grantEarlyBonus = async (user: any, wallet: any) => {
  if (!user.earlyAdopter || user.earlyAdopterGranted) return;

  wallet.balanceATC += 5; // example bonus
  user.earlyAdopterGranted = true;

  await wallet.save();
  await user.save();
};
