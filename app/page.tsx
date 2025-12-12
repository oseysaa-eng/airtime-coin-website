"use client";

import { useEffect, useState } from "react";

/* ================= CONSTANTS ================= */

const BANNERS = [
  "/banners/hero1.png",
  "/banners/hero2.png",
];

const WAITLIST_FORM =
  "https://docs.google.com/forms/d/e/1FAIpQLSd25k8HaeHdrfIrxS3JJ0p5tadTudox5YJHj8llAjko2iXpdA/viewform?usp=publish-editor";

/* ================= PAGE ================= */

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);

  /* HERO BACKGROUND ROTATION */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">

      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-black">
            AT₵
          </div>

          <div className="leading-tight">
            <div className="text-lg font-extrabold text-green-400 tracking-wide">
              Airtime
            </div>
            <div className="text-sm font-semibold text-yellow-400 -mt-1">
              Coin
            </div>
          </div>
        </div>

        <nav className="hidden md:flex gap-7 text-gray-300 text-sm">
          {[
            ["About", "#about"],
            ["How", "#how"],
            ["Features", "#features"],
            ["Security", "#security"],
            ["CSR", "#csr"],
            ["Waitlist", "#waitlist"],
            ["Contact", "#contact"],
          ].map(([label, link]) => (
            <a key={label} href={link} className="hover:text-white">
              {label}
            </a>
          ))}
        </nav>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${BANNERS[currentBanner]})` }}
        />
        <div className="absolute inset-0 bg-black/75" />

        <div className="relative z-10 px-6 text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
            <span className="text-white">Your Airtime.</span>{" "}
            <span className="text-green-400">Your Money.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Turning talk into opportunity across Africa.
          </p>

          <p className="text-gray-400 max-w-3xl mx-auto mb-10">
            Airtime Coin (ATC) converts everyday call minutes into real digital
            value — earn automatically, withdraw to MoMo, stake for growth,
            and fund real community impact.
          </p>

          <div className="flex justify-center flex-wrap gap-4">
            <a
              href={WAITLIST_FORM}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-atc-primary"
            >
              Join Early Access
            </a>

            <a
              href="#features"
              className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-lg text-lg font-semibold transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="bg-gray-950 px-8 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          {[
            ["Our Mission", "To empower everyday mobile users by converting airtime activity into tangible financial rewards while supporting communities."],
            ["Our Vision", "To build Africa’s leading airtime-backed digital financial ecosystem for economic inclusion."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="bg-gray-900 p-8 rounded-xl border border-gray-800"
            >
              <h2 className="text-2xl font-bold text-green-400 mb-4">
                {title}
              </h2>
              <p className="text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="px-8 py-20 text-center">
        <h3 className="text-3xl text-yellow-400 font-bold mb-10">
          How ATC Works
        </h3>

        <div className="max-w-4xl mx-auto grid md:grid-cols-4 gap-6 text-left">
          {[
            "Use your phone as usual",
            "Airtime converts into ATC",
            "Tokens appear in your wallet",
            "Withdraw, stake, or donate",
          ].map((step, i) => (
            <div
              key={i}
              className="bg-gray-900 p-5 rounded-xl border border-gray-800"
            >
              <div className="text-green-400 font-bold mb-2">
                Step {i + 1}
              </div>
              <p className="text-gray-300">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="bg-gray-950 px-8 py-20">
        <h3 className="text-3xl text-yellow-400 font-bold mb-10 text-center">
          Platform Features
        </h3>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            ["Frictionless Earnings", "Earn ATC from verified airtime usage."],
            ["MoMo Withdrawals", "Instant mobile money cash-out."],
            ["CSR Donations", "Support healthcare, disaster relief & youth programs."],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="bg-gray-900 p-6 rounded-xl border border-gray-800"
            >
              <h4 className="text-green-400 font-semibold mb-2">
                {title}
              </h4>
              <p className="text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SECURITY ================= */}
      <section id="security" className="px-8 py-20 text-center">
        <h3 className="text-3xl text-yellow-400 font-bold mb-6">
          Bank-Grade Security
        </h3>
        <p className="max-w-3xl mx-auto text-gray-300">
          Ghana Card KYC and biometric verification operate inside the ATC app.
          All user data is encrypted and protected to global standards.
        </p>
      </section>

      {/* ================= CSR ================= */}
      <section id="csr" className="bg-gray-950 px-8 py-20 text-center">
        <h3 className="text-3xl text-yellow-400 font-bold mb-6">
          Corporate Social Responsibility
        </h3>

        <p className="max-w-3xl mx-auto text-gray-300">
          Airtime Coin empowers communities through healthcare, youth education,
          emergency relief, and digital inclusion initiatives.
        </p>

        <div className="mt-8 inline-block bg-gray-900 border border-gray-700 rounded-xl px-6 py-3 text-yellow-400 font-semibold">
          🚧 Donations — Coming Soon
        </div>
      </section>

      {/* ================= WAITLIST ================= */}
      <section id="waitlist" className="text-center py-24">
        <h2 className="atc-heading text-6xl mb-6">
          Airtime → Crypto → Cash
        </h2>

        <p className="text-muted max-w-2xl mx-auto mb-8 text-lg">
          The world’s first platform converting call minutes into real digital assets.
        </p>

        <a
          href={WAITLIST_FORM}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-atc-primary glow-gold text-xl"
        >
          Join Waitlist
        </a>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="px-8 py-16 text-center">
        <h3 className="text-3xl font-bold mb-2">Contact</h3>
        <p className="text-gray-300">📧 info@airtimecoin.africa</p>
        <p className="text-gray-300">📧 support@airtimecoin.africa</p>
        <p className="text-gray-300">📍 Greater Kumasi, Ghana</p>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-gray-800 text-center py-6 text-gray-500">
        © {new Date().getFullYear()} Airtime Coin Africa. All rights reserved.
        <div className="mt-3 space-x-4">
          <a href="/privacy" className="hover:text-white">Privacy Policy</a>
          <a href="/terms" className="hover:text-white">Terms & Conditions</a>
        </div>
      </footer>

    </main>
  );
}
