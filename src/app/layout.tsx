import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TrueWealth | Know Your True Wealth",
  description: "Privacy-first net worth tracker. Track assets, goals, expenses & inflation.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "TrueWealth | Know Your True Wealth",
    description: "Privacy-first net worth tracker. Track assets, goals, expenses & inflation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased bg-[#0f172a] text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
