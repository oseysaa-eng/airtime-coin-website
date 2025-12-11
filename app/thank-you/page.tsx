export default function ThankYou() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">

      <h1 className="text-5xl font-extrabold mb-4 atc-heading">
        You're In ✅
      </h1>

      <p className="text-lg text-gray-300 mb-6 max-w-xl">
        Thank you for joining the Airtime Coin Early Access List.
        We’ve sent a confirmation email to your inbox.
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-xl">
        <p className="text-gray-400 mb-3">
          You will be contacted first for:
        </p>

        <ul className="text-left list-disc list-inside text-green-400">
          <li>Beta app launch access</li>
          <li>Early adopter token rewards</li>
          <li>Official Airtime Coin announcements</li>
        </ul>
      </div>

      <a
        href="/"
        className="mt-10 btn-atc-primary text-xl px-14 py-4"
      >
        Back to Website
      </a>

    </main>
  );
}
