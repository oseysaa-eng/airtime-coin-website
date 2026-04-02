export default function FraudAlert({ alert }: any) {
  if (!alert) return null;

  return (
    <div className="fixed top-5 right-5 bg-red-500 text-white p-4 rounded-xl shadow-lg z-50">
      <p className="font-bold">🚨 Fraud Detected</p>
      <p>{alert.message}</p>
    </div>
  );
}