export async function sendAirtime({
  phone,
  amountATC,
}: any) {
  return {
    success: true,
    value: amountATC * 1, // demo rate
    meta: { phone },
  };
}