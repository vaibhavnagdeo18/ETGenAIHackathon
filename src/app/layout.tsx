import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });

export const metadata: Metadata = {
  title: "SignalOS — Convergence-Based Stock Intelligence",
  description: "Identify high-probability stock alerts when multiple independent signals converge.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SignalOS",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${raleway.className} min-h-screen bg-stone-50 text-slate-900 selection:bg-indigo-500/20 overflow-x-hidden`}>
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200/20 blur-[120px] rounded-full" />
        </div>

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
