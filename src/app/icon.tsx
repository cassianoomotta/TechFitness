import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FFFFFF",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="t-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00C2FF" />
              <stop offset="40%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="db-grad" x1="0%" y1="0%" x2="0%" y2="100%">
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
            fill="url(#db-grad)"
          />

          {/* Left weights */}
          <rect x="22" y="37" width="3" height="26" rx="1.5" fill="url(#db-grad)" />
          <rect x="17" y="41" width="3" height="18" rx="1.5" fill="url(#db-grad)" />
          <rect x="12" y="45" width="3" height="10" rx="1.5" fill="url(#db-grad)" />

          {/* Right weights */}
          <rect x="75" y="37" width="3" height="26" rx="1.5" fill="url(#db-grad)" />
          <rect x="80" y="41" width="3" height="18" rx="1.5" fill="url(#db-grad)" />
          <rect x="85" y="45" width="3" height="10" rx="1.5" fill="url(#db-grad)" />

          {/* Slanted "T" logo */}
          <path
            d="M32 28 H78 L74 38 H54 L44 78 H35 L45 38 H27 L32 28 Z"
            fill="url(#t-grad)"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
