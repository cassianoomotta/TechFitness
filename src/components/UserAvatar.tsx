"use client";

import React from "react";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  border?: boolean;
}

const sizeClasses = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-14 h-14 text-base font-bold",
  xl: "w-20 h-20 text-xl font-extrabold",
};

export default function UserAvatar({
  name,
  image,
  size = "md",
  className = "",
  border = true,
}: UserAvatarProps) {
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "TF";

  const sizeClass = sizeClasses[size];
  const borderClass = border ? "ring-2 ring-white/80 shadow-sm" : "";

  if (image) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 ${sizeClass} ${borderClass} ${className}`}
      >
        <img
          src={image}
          alt={name || "Avatar do usuário"}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
          onError={(e) => {
            // Se a imagem falhar, remove a imagem para exibir fallback com iniciais
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-[#2563EB] to-[#00C2FF] text-white font-display tracking-wider shrink-0 ${sizeClass} ${borderClass} ${className}`}
      title={name || "Usuário"}
    >
      <span>{initials}</span>
    </div>
  );
}
