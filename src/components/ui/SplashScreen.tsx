"use client";

import React, { useState, useEffect } from "react";

export default function SplashScreen() {
  const [stage, setStage] = useState<"visible" | "fading" | "hidden">("visible");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing Calyx financial telemetry...");

  useEffect(() => {
    // Progress increment over ~3.5 seconds
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 1;
      });
    }, 34);

    // Status updates across the duration
    const t1 = setTimeout(() => {
      setStatusText("Synchronizing recurring revenue from Stripe & Paddle...");
    }, 1100);

    const t2 = setTimeout(() => {
      setStatusText("Verifying multi-tenant ledger & tax compliance rules...");
    }, 2200);

    const t3 = setTimeout(() => {
      setStatusText("Enclave ready • Loading workspace");
    }, 3200);

    // Start fade-out at 3.6s
    const fadeTimer = setTimeout(() => {
      setStage("fading");
    }, 3600);

    // Hide completely after fade transition at 4.2s
    const hideTimer = setTimeout(() => {
      setStage("hidden");
    }, 4200);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (stage === "hidden") return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#14201A] text-white transition-opacity duration-600 ease-out select-none ${
        stage === "fading" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Main Brand Lockup - Clean, crisp, no blurry shadow halos */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm w-full">
        {/* Calyx Botanical Mark - Big, standalone, not in any container */}
        <div className="mb-6 flex items-center justify-center">
          <svg
            width="96"
            height="96"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-500"
          >
            {/* Outer Sepal Left */}
            <path
              d="M8 22C8 16 11 11 16 9C11.5 13 11 18 11 22H8Z"
              fill="#4EAD74"
              fillOpacity="0.95"
            />
            {/* Outer Sepal Right */}
            <path
              d="M24 22C24 16 21 11 16 9C20.5 13 21 18 21 22H24Z"
              fill="#4EAD74"
              fillOpacity="0.95"
            />
            {/* Central Stem & Emerging Bud */}
            <path
              d="M16 23V11M16 11C14.5 9 14 7 16 5C18 7 17.5 9 16 11Z"
              stroke="#FAF9F6"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="flex items-baseline mb-2">
          <span className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white">
            calyx
          </span>
        </div>

        <p className="text-xs text-stone-400 font-medium tracking-wide uppercase font-mono">
          Recurring Revenue Intelligence
        </p>

        {/* Dynamic Status Text */}
        <div className="mt-8 h-5 flex items-center justify-center">
          <span className="text-[11px] font-mono text-emerald-400/90 transition-all duration-300">
            {statusText}
          </span>
        </div>

        {/* Progress Bar - Crisp 1px border, no glow shadow */}
        <div className="w-52 h-1.5 bg-[#1B2B23] rounded-full mt-3 overflow-hidden border border-[#2B3D33]">
          <div
            className="h-full bg-[#388E5C] rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-2.5 text-[11px] font-mono text-stone-500 tabular-nums">
          {progress}%
        </div>
      </div>
    </div>
  );
}
