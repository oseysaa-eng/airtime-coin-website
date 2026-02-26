export default function IncidentBanner({
  message,
}: {
  message: string;
}) {
  if (!message) return null;

  return (
    <div className="bg-red-600 text-white text-sm p-2 text-center">
      🚨 {message}
    </div>
  );
}