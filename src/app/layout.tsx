import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  keywords: ["Base", "Base builder", "onchain", "dApp", "wallet"],
  metadataBase: new URL("https://base-gm-streak.vercel.app"),
  title: "Base GM Streak",
  // Base builder identity: project-level proof uses Build ID, Builder Wallet, Vercel Live Demo, and GitHub repository.
  description:
    "A clean daily GM check-in dApp for Base with wallet connect, onchain signal, streaks, and shareable receipts.",
  other: {
    "base:app_id": "69fc7b8abced645c370bd8f9",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
