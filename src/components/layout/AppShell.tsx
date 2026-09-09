"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import ToastContainer from "../ui/ToastContainer";
import SplashScreen from "../ui/SplashScreen";
import { useAuth } from "@/context/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password";

  // Route protection guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isAuthRoute) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, isAuthRoute, pathname, router]);

  // If on an authentication page, render clean standalone layout
  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1A1C1A]">
        {children}
        <ToastContainer />
      </div>
    );
  }

  // If session is still loading or unauthenticated and awaiting redirect
  if (!isLoading && !isAuthenticated && !isAuthRoute) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-bold text-sm tracking-widest animate-pulse">
            CX
          </div>
          <p className="text-xs font-medium text-stone-500">Redirecting to secure login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1C1A] flex flex-col md:flex-row">
      {/* Initial Boot / Brand Splash Screen */}
      <SplashScreen />

      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileNavOpen} setMobileOpen={setMobileNavOpen} />

      {/* Main content column */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 pb-12">
        <TopHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
