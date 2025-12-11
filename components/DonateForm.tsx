"use client";

import { useState } from "react";

export default function DonateForm() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  async function donate(e: React.FormEvent) {
    e.preventDefault();

    if (!amount) {
      alert("Donation amount is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount
        }),
      });

      if (res.ok) {
        alert("Thanks for supporting our CSR 🎉");
        setName("");
        setAmount("");
      } else {
        alert("Donation failed. Try again.");
      }

    } catch (error) {
      alert("Network error.");
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={donate}
      className="max-w-md mx-auto bg-gray-900 border border-gray-800 p-6 rounded-xl"
    >
      <h3 className="text-xl font-bold text-yellow-400 mb-4">
        Support Our CSR Programs
      </h3>

      <input
        type="text"
        placeholder="Your name (optional)"
        className="w-full p-3 rounded bg-black border border-gray-700 mb-3"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Donation amount (GHS)"
        className="w-full p-3 rounded bg-black border border-gray-700 mb-3"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 text-black py-3 rounded-lg font-semibold transition"
      >
        {loading ? "Processing..." : "Donate"}
      </button>
    </form>
  );
}
