export async function payDSTV({
  accountId,
  amountATC,
}: any) {
  return {
    success: true,
    value: "DSTV PAYMENT SUCCESS",
    meta: { accountId },
  };
}