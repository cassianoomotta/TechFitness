"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  border?: boolean;
  expandable?: boolean;
  subtitle?: string;
  onClick?: (e: React.MouseEvent) => void;
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
  expandable = true,
  subtitle,
  onClick,
}: UserAvatarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

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
  const canExpand = expandable && Boolean(image) && !imageError;

  const handleClick = (e: React.MouseEvent) => {
    if (canExpand) {
      e.stopPropagation();
      e.preventDefault();
      setIsExpanded(true);
    }
    if (onClick) {
      onClick(e);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsExpanded(false);
  };

  if (image && !imageError) {
    return (
      <>
        <div
          role={canExpand ? "button" : undefined}
          tabIndex={canExpand ? 0 : undefined}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (canExpand && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(true);
            }
          }}
          title={
            canExpand
              ? name
                ? `Ver foto de ${name}`
                : "Ver foto de perfil"
              : name || undefined
          }
          aria-label={
            canExpand
              ? name
                ? `Ver foto de perfil de ${name}`
                : "Ver foto de perfil"
              : undefined
          }
          className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${
            canExpand
              ? "cursor-pointer hover:opacity-90 active:scale-95 transition-all duration-200"
              : ""
          } ${sizeClass} ${borderClass} ${className}`}
        >
          <img
            src={image}
            alt={name || "Avatar do usuário"}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Modal de Foto de Perfil Expandida (Estilo WhatsApp) */}
        {isExpanded && mounted && typeof document !== "undefined" && createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={name ? `Foto de perfil de ${name}` : "Foto de perfil"}
            onClick={handleClose}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          >
            {/* Card WhatsApp Style */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs sm:max-w-sm bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col animate-in zoom-in-95 duration-200"
            >
              {/* Top Header Bar */}
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-zinc-900/95 border-b border-white/10 flex items-center justify-between text-white">
                <div className="min-w-0 pr-3">
                  <h4 className="text-sm sm:text-base font-bold text-white truncate tracking-tight">
                    {name || "Atleta"}
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-medium truncate">
                    {subtitle || "Foto do perfil"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="Fechar foto"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Foto Centralizada (sem estourar resolução) */}
              <div className="relative w-full aspect-square bg-zinc-900 flex items-center justify-center overflow-hidden">
                <img
                  src={image}
                  alt={name || "Foto de perfil"}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              </div>

              {/* Footer minimalista */}
              <div className="px-4 py-2.5 bg-zinc-900/60 border-t border-white/5 flex items-center justify-center">
                <span className="text-[11px] text-zinc-400 font-medium">
                  Toque fora ou no X para fechar
                </span>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-[#2563EB] to-[#00C2FF] text-white font-display tracking-wider shrink-0 select-none ${sizeClass} ${borderClass} ${className}`}
      title={name || "Usuário"}
    >
      <span>{initials}</span>
    </div>
  );
}
