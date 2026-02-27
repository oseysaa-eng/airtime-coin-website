"use client";

import { useEffect } from "react";
import { event } from "@/lib/gtag";

export default function ThankYouPage() {
  useEffect(() => {
    event({
      action: "waitlist_signup_complete",
      category: "conversion",
      label: "Google Form Submission",
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          🎉 You’re on the Waitlist!
        </h1>
        <p className="text-gray-400">
          We’ll notify you when Airtime Coin launches.
        </p>
      </div>
    </div>
  );
}
