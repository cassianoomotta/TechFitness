import React, { useState, useEffect } from "react";
import {
  Camera,
  Loader2,
  Trophy,
  ChevronDown,
  ChevronUp,
  Users,
  Search,
  Maximize2,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import FullRankingModal from "./FullRankingModal";
import { WeeklyCheckinFeedItem } from "@/components/StudentWorkoutInstagramCard";

export interface RankingItem {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
  level: number;
  levelTitle: string;
  totalXp: number;
  totalSessions: number;
  weeklyCheckins?: Array<{
    id: string;
    date: string;
    dayOfWeek: string;
    dayOfWeekFull: string;
    formattedDate: string;
    photoUrl: string;
    durationMinutes: number;
    satisfaction?: number;
  }>;
}

export interface RankingData {
  top5: RankingItem[];
  allRanked?: RankingItem[];
  userPosition: number;
  totalParticipants: number;
  weeklyFeed?: WeeklyCheckinFeedItem[];
}

interface RankingLeaderboardProps {
  ranking: RankingData | null;
  loading: boolean;
  onOpenCheckinPhoto: (photo: {
    id: string;
    photoUrl: string;
    studentName: string;
    studentImage?: string | null;
    dayOfWeekFull: string;
    formattedDate: string;
  }) => void;
}

export default function RankingLeaderboard({
  ranking,
  loading,
  onOpenCheckinPhoto,
}: RankingLeaderboardProps) {
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allRankedData, setAllRankedData] = useState<RankingItem[]>(
    ranking?.allRanked && ranking.allRanked.length > 0
      ? ranking.allRanked
      : ranking?.top5 || []
  );
  const [fetchingAll, setFetchingAll] = useState(false);

  // Sincronizar dados quando a prop ranking for atualizada
  useEffect(() => {
    if (ranking?.allRanked && ranking.allRanked.length > 0) {
      setAllRankedData(ranking.allRanked);
    } else if (ranking?.top5 && ranking.top5.length > 0) {
      setAllRankedData(ranking.top5);
    }
  }, [ranking?.allRanked, ranking?.top5]);

  if (loading) {
    return (
      <section className="mb-8 bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center py-12 text-[#94A3B8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
        <p className="text-xs">Carregando classificação dos Titãs...</p>
      </section>
    );
  }

  if (!ranking || ranking.top5.length === 0) {
    return null;
  }

  const totalParticipants = Math.max(
    ranking.totalParticipants || 0,
    allRankedData.length,
    ranking.top5.length
  );
  const hasMoreThan5 = totalParticipants > 5 || allRankedData.length > 5;

  const ensureFullListLoaded = async () => {
    if (allRankedData.length < totalParticipants && totalParticipants > 5) {
      try {
        setFetchingAll(true);
        const res = await fetch("/api/student/ranking", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.allRanked && data.allRanked.length > 0) {
            setAllRankedData(data.allRanked);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar lista completa de ranking:", err);
      } finally {
        setFetchingAll(false);
      }
    }
  };

  const handleToggleFullRanking = async () => {
    if (!showFullRanking) {
      await ensureFullListLoaded();
    }
    setShowFullRanking((prev) => !prev);
  };

  const handleOpenModal = async () => {
    await ensureFullListLoaded();
    setIsModalOpen(true);
  };

  const displayedList = showFullRanking
    ? allRankedData.slice(3)
    : allRankedData.slice(3, 5);

  return (
    <>
      <section className="mb-8 bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Liga dos Titãs — Ranking Geral</span>
          </h3>

          <div className="flex items-center gap-1.5">
            {hasMoreThan5 ? (
              <button
                type="button"
                onClick={handleToggleFullRanking}
                className="text-[11px] bg-blue-50 hover:bg-blue-100 border border-blue-200/90 hover:border-blue-300 px-3 py-1.5 rounded-full font-bold text-[#2563EB] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                title={showFullRanking ? "Recolher para TOP 5" : "Ver todos os atletas no ranking"}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{totalParticipants} atletas ativos</span>
                {showFullRanking ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <span className="text-[11px] bg-[#2563EB]/5 border border-[#2563EB]/15 px-3 py-1.5 rounded-full font-bold text-[#2563EB] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{totalParticipants} atletas ativos</span>
              </span>
            )}
          </div>
        </div>

        {/* Pódio visual (Top 3) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 pb-2 border-b border-[#E2E8F0]/50 items-end">
          {/* 2º Lugar (Esquerda) */}
          {ranking.top5[1] && (
            <div className="flex flex-col items-center text-center space-y-1.5 order-1">
              <div className="relative">
                <UserAvatar
                  name={ranking.top5[1].name}
                  image={ranking.top5[1].image}
                  size="lg"
                  className="border-2 border-slate-300 shadow-sm"
                />
                <span className="absolute -bottom-1.5 -right-1 bg-slate-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-extrabold border border-white shadow-sm">
                  2
                </span>
              </div>
              <div className="min-w-0 w-full">
                <p className="text-[11px] font-bold text-[#475569] truncate px-1">
                  {ranking.top5[1].name}
                </p>
                <p className="text-[9px] text-slate-500 font-mono font-bold">
                  {ranking.top5[1].totalXp} XP
                </p>
                {ranking.top5[1].weeklyCheckins && ranking.top5[1].weeklyCheckins.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                    {ranking.top5[1].weeklyCheckins.map((chk) => (
                      <button
                        key={chk.id}
                        type="button"
                        onClick={() =>
                          onOpenCheckinPhoto({
                            id: chk.id,
                            photoUrl: chk.photoUrl,
                            studentName: ranking.top5[1].name,
                            studentImage: ranking.top5[1].image,
                            dayOfWeekFull: chk.dayOfWeekFull,
                            formattedDate: chk.formattedDate,
                          })
                        }
                        className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-blue-50 text-[#2563EB] border border-blue-200/80 hover:bg-blue-100 flex items-center gap-0.5 cursor-pointer transition-colors"
                        title={`${chk.dayOfWeekFull} (${chk.formattedDate}) - Ver foto`}
                      >
                        <Camera className="w-2.5 h-2.5" />
                        {chk.dayOfWeek}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full h-10 bg-slate-200/50 rounded-t-lg border-x border-t border-slate-200 flex items-center justify-center">
                <span className="text-[9px] font-extrabold text-slate-500 font-mono">2º</span>
              </div>
            </div>
          )}

          {/* 1º Lugar (Centro) */}
          {ranking.top5[0] && (
            <div className="flex flex-col items-center text-center space-y-1.5 order-2">
              <div className="relative">
                <UserAvatar
                  name={ranking.top5[0].name}
                  image={ranking.top5[0].image}
                  size="xl"
                  className="border-3 border-amber-400 shadow-md ring-2 ring-amber-400/20"
                />
                <span className="absolute -bottom-1.5 -right-1 bg-amber-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold border-2 border-white shadow-sm">
                  👑
                </span>
              </div>
              <div className="min-w-0 w-full">
                <p className="text-xs font-black text-amber-600 truncate px-1">
                  {ranking.top5[0].name}
                </p>
                <p className="text-[10px] text-amber-500 font-mono font-bold">
                  {ranking.top5[0].totalXp} XP
                </p>
                {ranking.top5[0].weeklyCheckins && ranking.top5[0].weeklyCheckins.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                    {ranking.top5[0].weeklyCheckins.map((chk) => (
                      <button
                        key={chk.id}
                        type="button"
                        onClick={() =>
                          onOpenCheckinPhoto({
                            id: chk.id,
                            photoUrl: chk.photoUrl,
                            studentName: ranking.top5[0].name,
                            studentImage: ranking.top5[0].image,
                            dayOfWeekFull: chk.dayOfWeekFull,
                            formattedDate: chk.formattedDate,
                          })
                        }
                        className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 flex items-center gap-0.5 cursor-pointer transition-colors"
                        title={`${chk.dayOfWeekFull} (${chk.formattedDate}) - Ver foto`}
                      >
                        <Camera className="w-2.5 h-2.5" />
                        {chk.dayOfWeek}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full h-14 bg-amber-100/40 rounded-t-lg border-x border-t border-amber-200/80 flex items-center justify-center shadow-inner">
                <span className="text-xs font-black text-amber-600 font-mono">1º</span>
              </div>
            </div>
          )}

          {/* 3º Lugar (Direita) */}
          {ranking.top5[2] && (
            <div className="flex flex-col items-center text-center space-y-1.5 order-3">
              <div className="relative">
                <UserAvatar
                  name={ranking.top5[2].name}
                  image={ranking.top5[2].image}
                  size="lg"
                  className="border-2 border-amber-600/50 shadow-sm"
                />
                <span className="absolute -bottom-1.5 -right-1 bg-amber-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-extrabold border border-white shadow-sm">
                  3
                </span>
              </div>
              <div className="min-w-0 w-full">
                <p className="text-[11px] font-bold text-amber-800/80 truncate px-1">
                  {ranking.top5[2].name}
                </p>
                <p className="text-[9px] text-amber-700/70 font-mono font-bold">
                  {ranking.top5[2].totalXp} XP
                </p>
                {ranking.top5[2].weeklyCheckins && ranking.top5[2].weeklyCheckins.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                    {ranking.top5[2].weeklyCheckins.map((chk) => (
                      <button
                        key={chk.id}
                        type="button"
                        onClick={() =>
                          onOpenCheckinPhoto({
                            id: chk.id,
                            photoUrl: chk.photoUrl,
                            studentName: ranking.top5[2].name,
                            studentImage: ranking.top5[2].image,
                            dayOfWeekFull: chk.dayOfWeekFull,
                            formattedDate: chk.formattedDate,
                          })
                        }
                        className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex items-center gap-0.5 cursor-pointer transition-colors"
                        title={`${chk.dayOfWeekFull} (${chk.formattedDate}) - Ver foto`}
                      >
                        <Camera className="w-2.5 h-2.5" />
                        {chk.dayOfWeek}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-full h-7 bg-amber-100/10 rounded-t-lg border-x border-t border-amber-200/30 flex items-center justify-center">
                <span className="text-[9px] font-extrabold text-amber-700/70 font-mono">3º</span>
              </div>
            </div>
          )}
        </div>

        {/* Lista dos demais (4º em diante) */}
        {displayedList.length > 0 && (
          <div className="space-y-2 pt-1">
            {displayedList.map((user, idx) => {
              const position = idx + 4;
              const isCurrentUser = position === ranking.userPosition;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 ${
                    isCurrentUser
                      ? "bg-blue-50/80 border-2 border-[#2563EB]/40 shadow-xs"
                      : "bg-zinc-50/80 border border-[#E2E8F0] hover:bg-zinc-100/50 hover:border-[#2563EB]/20"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-xs font-bold w-5 text-center font-mono ${
                        isCurrentUser
                          ? "text-[#2563EB] font-extrabold"
                          : "text-[#94A3B8]"
                      }`}
                    >
                      {position}º
                    </span>
                    <UserAvatar
                      name={user.name}
                      image={user.image}
                      size="sm"
                      className="border border-[#E2E8F0] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-[#0F172A] truncate">
                          {user.name}
                        </p>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[#2563EB] text-[9px] font-black uppercase shrink-0">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-[#94A3B8]">
                        Lvl {user.level} • {user.levelTitle}
                      </p>
                      {user.weeklyCheckins && user.weeklyCheckins.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {user.weeklyCheckins.map((chk) => (
                            <button
                              key={chk.id}
                              type="button"
                              onClick={() =>
                                onOpenCheckinPhoto({
                                  id: chk.id,
                                  photoUrl: chk.photoUrl,
                                  studentName: user.name,
                                  studentImage: user.image,
                                  dayOfWeekFull: chk.dayOfWeekFull,
                                  formattedDate: chk.formattedDate,
                                })
                              }
                              className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-blue-50 text-[#2563EB] border border-blue-200/80 hover:bg-blue-100 flex items-center gap-0.5 cursor-pointer transition-colors"
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
                    <p className="text-xs font-extrabold text-[#2563EB] font-mono">
                      {user.totalXp} XP
                    </p>
                    <p className="text-[8px] text-[#94A3B8] font-medium">
                      {user.totalSessions}{" "}
                      {user.totalSessions === 1 ? "treino" : "treinos"}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Ações de Expansão / Ver Ranking Completo */}
            {hasMoreThan5 && (
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleToggleFullRanking}
                  disabled={fetchingAll}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 hover:from-blue-100 hover:to-indigo-50 border-2 border-blue-200/90 hover:border-[#2563EB]/40 text-xs font-black text-[#2563EB] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] min-h-[48px]"
                >
                  {fetchingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                      <span>Carregando todos os atletas...</span>
                    </>
                  ) : showFullRanking ? (
                    <>
                      <ChevronUp className="w-4 h-4 text-[#2563EB]" />
                      <span>Mostrar apenas o TOP 5</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>
                        Ver Ranking Completo (todos os {totalParticipants} atletas)
                      </span>
                      <ChevronDown className="w-4 h-4 text-[#2563EB]" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] min-h-[48px]"
                  title="Abrir ranking em modal com busca"
                >
                  <Search className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">Buscar Atleta</span>
                  <span className="sm:hidden">Buscar</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Posição do Usuário Logado */}
        {ranking.userPosition > 5 && (
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-center">
            <p className="text-xs text-[#1E40AF] font-bold">
              Você está na{" "}
              <span className="font-extrabold">{ranking.userPosition}ª</span>{" "}
              posição geral.
            </p>
            <p className="text-[10px] text-[#64748B] mt-0.5">
              Conclua mais treinos e registre PRs para subir no ranking! ⚡
            </p>
          </div>
        )}
        {ranking.userPosition > 0 && ranking.userPosition <= 5 && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
            <p className="text-xs text-emerald-700 font-bold">
              Você está no TOP 5! Posição atual:{" "}
              <span className="font-extrabold">{ranking.userPosition}º Lugar</span> 🎉
            </p>
          </div>
        )}
      </section>

      {/* Modal de Classificação Completa com Busca */}
      <FullRankingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rankingList={allRankedData}
        userPosition={ranking.userPosition}
        totalParticipants={totalParticipants}
        onOpenCheckinPhoto={onOpenCheckinPhoto}
      />
    </>
  );
}
