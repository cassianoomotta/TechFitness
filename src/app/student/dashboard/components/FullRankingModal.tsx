"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Trophy,
  X,
  Search,
  Camera,
  Crown,
  Medal,
  Award,
  Sparkles,
  Flame,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { RankingItem } from "./RankingLeaderboard";

interface FullRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankingList: RankingItem[];
  userPosition: number;
  totalParticipants: number;
  onOpenCheckinPhoto: (photo: {
    id: string;
    photoUrl: string;
    studentName: string;
    studentImage?: string | null;
    dayOfWeekFull: string;
    formattedDate: string;
  }) => void;
}

export default function FullRankingModal({
  isOpen,
  onClose,
  rankingList,
  userPosition,
  totalParticipants,
  onOpenCheckinPhoto,
}: FullRankingModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fechar no Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return rankingList;
    const q = searchQuery.toLowerCase().trim();
    return rankingList.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [rankingList, searchQuery]);

  if (!isOpen) return null;

  const currentUserItem = rankingList[userPosition - 1] || null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#0F172A] truncate">
                  Liga dos Titãs — Ranking Completo
                </h3>
              </div>
              <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                <span>{totalParticipants} atletas no ranking</span>
                <span>•</span>
                <span className="text-[#2563EB] font-bold">
                  Sua Posição: {userPosition > 0 ? `${userPosition}º Lugar` : "Não classificado"}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center cursor-pointer shrink-0 min-h-[44px]"
            title="Fechar ranking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar atleta por nome..."
              className="w-full pl-9 pr-8 py-2 text-base md:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de Atletas (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 divide-y divide-slate-100/60">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-semibold">Nenhum atleta encontrado.</p>
              <p className="text-xs text-slate-400 mt-1">
                Tente buscar com outro nome.
              </p>
            </div>
          ) : (
            filteredList.map((student, idx) => {
              // Posição real na lista geral
              const rankPos = rankingList.findIndex((s) => s.id === student.id) + 1;
              const isCurrentUser = rankPos === userPosition;

              let rankBadge = (
                <span className="w-7 text-center text-xs font-bold text-slate-400 font-mono">
                  {rankPos}º
                </span>
              );

              if (rankPos === 1) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center text-xs font-black shadow-2xs shrink-0">
                    👑
                  </div>
                );
              } else if (rankPos === 2) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-black shadow-2xs shrink-0">
                    🥈
                  </div>
                );
              } else if (rankPos === 3) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-600/30 text-amber-800 flex items-center justify-center text-xs font-black shadow-2xs shrink-0">
                    🥉
                  </div>
                );
              }

              return (
                <div
                  key={student.id}
                  className={`pt-2.5 first:pt-0 flex items-center justify-between p-3 rounded-2xl transition-all ${
                    isCurrentUser
                      ? "bg-blue-50/80 border-2 border-[#2563EB]/40 shadow-xs"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {rankBadge}
                    <UserAvatar
                      name={student.name}
                      image={student.image}
                      size="md"
                      className="border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
                          {student.name}
                        </p>
                        {isCurrentUser && (
                          <span className="px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[9px] font-black uppercase tracking-wider shrink-0 shadow-2xs">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Lvl {student.level} • {student.levelTitle}
                      </p>

                      {/* Check-ins com foto */}
                      {student.weeklyCheckins && student.weeklyCheckins.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {student.weeklyCheckins.map((chk) => (
                            <button
                              key={chk.id}
                              type="button"
                              onClick={() => {
                                onOpenCheckinPhoto({
                                  id: chk.id,
                                  photoUrl: chk.photoUrl,
                                  studentName: student.name,
                                  studentImage: student.image,
                                  dayOfWeekFull: chk.dayOfWeekFull,
                                  formattedDate: chk.formattedDate,
                                });
                              }}
                              className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-blue-50 text-[#2563EB] border border-blue-200 hover:bg-blue-100 flex items-center gap-0.5 cursor-pointer transition-colors"
                              title={`${chk.dayOfWeekFull} (${chk.formattedDate}) - Ver foto`}
                            >
                              <Camera className="w-2.5 h-2.5" />
                              {chk.dayOfWeek}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <p className="text-xs sm:text-sm font-black text-[#2563EB] font-mono">
                      {student.totalXp} XP
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium">
                      {student.totalSessions}{" "}
                      {student.totalSessions === 1 ? "treino" : "treinos"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer com Destaque para o Usuário Atual */}
        {currentUserItem && (
          <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#0F172A]">
                Sua Classificação:
              </span>
              <span className="font-extrabold text-[#2563EB]">
                {userPosition}º Lugar
              </span>
            </div>
            <span className="font-mono font-bold text-slate-600">
              {currentUserItem.totalXp} XP total
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
