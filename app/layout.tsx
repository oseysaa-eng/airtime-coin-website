import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

/* ================= FONTS ================= */
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/* ================= METADATA ================= */
export const metadata: Metadata = {
  title: "AirtimeCoin Africa – Convert Airtime to Crypto",
  description:
    "Airtime Coin (ATC) lets you convert airtime into real cryptocurrency. Withdraw to MoMo, earn rewards, and join the future of telecom finance.",
  metadataBase: new URL("https://www.airtimecoin.africa"),
  openGraph: {
    title: "AirtimeCoin Africa",
    description: "Convert airtime into crypto instantly.",
    url: "https://www.airtimecoin.africa",
    siteName: "AirtimeCoin Africa",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AirtimeCoin Africa",
      },
    ],
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AirtimeCoin Africa",
    description: "Convert airtime into crypto instantly.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
  },
};

/* ================= ROOT LAYOUT ================= */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BT18WQWMCB"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BT18WQWMCB');
          `}
        </Script>
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
