import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UIStateProvider } from "@/context/UIStateContext";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calyx — SaaS Billing & Recurring Revenue Intelligence",
  description:
    "Production-grade subscription billing, MRR analytics, and invoice management dashboard built with pixel-perfect visual fidelity.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FAF9F6] text-[#1A1C1A]">
        <AuthProvider>
          <UIStateProvider>
            <AppShell>{children}</AppShell>
          </UIStateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
