import React from "react";

interface BrandLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColorClass?: string;
}

export default function BrandLogo({
  className = "",
  size = 40,
  showText = true,
  textColorClass = "text-[#0F172A]",
}: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Dynamic SVG Logo */}
      <div 
        style={{ width: size, height: size }} 
        className="flex items-center justify-center shrink-0"
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-t-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00C2FF" />
              <stop offset="40%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="logo-db-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Dumbbell horizontal bar */}
          <rect
            x="20"
            y="48.5"
            width="60"
            height="3"
            rx="1"
            fill="url(#logo-db-grad)"
          />

          {/* Left weights */}
          <rect x="22" y="37" width="3" height="26" rx="1.5" fill="url(#logo-db-grad)" />
          <rect x="17" y="41" width="3" height="18" rx="1.5" fill="url(#logo-db-grad)" />
          <rect x="12" y="45" width="3" height="10" rx="1.5" fill="url(#logo-db-grad)" />

          {/* Right weights */}
          <rect x="75" y="37" width="3" height="26" rx="1.5" fill="url(#logo-db-grad)" />
          <rect x="80" y="41" width="3" height="18" rx="1.5" fill="url(#logo-db-grad)" />
          <rect x="85" y="45" width="3" height="10" rx="1.5" fill="url(#logo-db-grad)" />

          {/* Slanted "T" logo */}
          <path
            d="M32 28 H78 L74 38 H54 L44 78 H35 L45 38 H27 L32 28 Z"
            fill="url(#logo-t-grad)"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-display font-bold text-2xl tracking-wider uppercase ${textColorClass}`}>
          Tech<span className="text-[#2563EB]">Fitness</span>
        </span>
      )}
    </div>
  );
}
