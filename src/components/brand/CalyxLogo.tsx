import React from "react";

interface CalyxLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "mark";
  className?: string;
  theme?: "dark" | "light";
}

export default function CalyxLogo({
  size = "md",
  variant = "full",
  className = "",
  theme = "light",
}: CalyxLogoProps) {
  const sizeMap = {
    sm: { icon: 22, text: "text-base", gap: "gap-2" },
    md: { icon: 28, text: "text-xl", gap: "gap-2.5" },
    lg: { icon: 36, text: "text-2xl", gap: "gap-3" },
  };

  const currentSize = sizeMap[size];
  const isDark = theme === "dark";

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {/* Botanical Calyx Mark: Protective sepals holding recurring growth */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Calyx rounded container */}
          <rect width="32" height="32" rx="8" fill="#2D5A43" />
          
          {/* Outer Sepal Left */}
          <path
            d="M8 22C8 16 11 11 16 9C11.5 13 11 18 11 22H8Z"
            fill="#7FA987"
            fillOpacity="0.9"
          />
          {/* Outer Sepal Right */}
          <path
            d="M24 22C24 16 21 11 16 9C20.5 13 21 18 21 22H24Z"
            fill="#7FA987"
            fillOpacity="0.9"
          />
          {/* Central Stem & Emerging Bud */}
          <path
            d="M16 23V11M16 11C14.5 9 14 7 16 5C18 7 17.5 9 16 11Z"
            stroke="#FAF9F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner Accent Ring */}
          <circle cx="16" cy="16" r="2" fill="#FAF9F6" />
        </svg>
      </div>

      {variant === "full" && (
        <div className="flex items-baseline">
          <span
            className={`font-bold tracking-tight font-sans ${currentSize.text} ${
              isDark ? "text-white" : "text-[#1A1C1A]"
            }`}
          >
            calyx
          </span>
        </div>
      )}
    </div>
  );
}
