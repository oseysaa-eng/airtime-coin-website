export const getDonationBadge = (amount: number) => {
  if (amount >= 1000) return "Top Donor";
  if (amount >= 500) return "Champion";
  if (amount >= 200) return "Legend";
  if (amount >= 100) return "Hero";
  if (amount >= 20) return "Supporter";
  return "None";
};
