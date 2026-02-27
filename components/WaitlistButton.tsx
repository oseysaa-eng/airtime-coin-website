"use client";

import { event } from "@/lib/gtag";

export default function WaitlistButton() {
  const handleClick = () => {
    event({
      action: "join_waitlist_click",
      category: "engagement",
      label: "Waitlist Button",
    });

    window.open(
      "https://docs.google.com/forms/d/e/1FAIpQLSd25k8HaeHdrfIrxS3JJ0p5tadTudox5YJHj8llAjko2iXpdA/viewform?usp=publish-editor",
      "_blank"
    );
  };

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 rounded-xl bg-yellow-400 text-black font-semibold hover:opacity-90"
    >
      Join the Waitlist
    </button>
  );
}
