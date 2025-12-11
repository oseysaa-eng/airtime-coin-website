// components/Header.tsx
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-black text-white border-b border-[#0f2418]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/icon.png"
            alt="Airtime Coin logo"
            width={44}
            height={44}
            priority
          />
          <div className="leading-none">
            <div className="text-lg font-extrabold text-green-400 tracking-wider">Airtime</div>
            <div className="text-sm font-semibold text-yellow-400 -mt-1">Coin</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 text-gray-300">
          <a href="#features" className="hover:text-yellow-400">Features</a>
          <a href="#security" className="hover:text-yellow-400">Security</a>
          <a href="#csr" className="hover:text-yellow-400">CSR</a>
          <a href="#download" className="hover:text-yellow-400">Download</a>
          <a href="#contact" className="hover:text-yellow-400">Contact</a>
        </nav>
      </div>
    </header>
  );
}
