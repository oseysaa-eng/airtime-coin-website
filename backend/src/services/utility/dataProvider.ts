export async function sendData({
  phone,
  network,
  amountATC,
}: any) {
  return {
    success: true,
    value: `${amountATC * 100}MB`,
    meta: { phone, network },
  };
}