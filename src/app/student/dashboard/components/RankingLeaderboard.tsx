import React, { useState, useEffect } from "react";
import {
  Camera,
  Loader2,
  Trophy,
  ChevronDown,
  ChevronUp,
  Users,
  Search,
  HelpCircle,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import FullRankingModal from "./FullRankingModal";
import { WeeklyCheckinFeedItem } from "@/components/StudentWorkoutInstagramCard";
import DumbbellLoading from "@/components/DumbbellLoading";

export interface RankingItem {
  id: string;
  name: string;
  email?: string;
  image?: string | null;
  level: number;
  levelTitle: string;
  totalXp: number;
  displayXp?: number;
  weeklyXp?: number;
  monthlyXp?: number;
  weeklyGoal?: number;
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

export interface RankingPeriodData {
  top5: RankingItem[];
  allRanked: RankingItem[];
  userPosition: number;
}

export interface RankingData {
  top5: RankingItem[];
  allRanked?: RankingItem[];
  userPosition: number;
  totalParticipants: number;
  weeklyFeed?: WeeklyCheckinFeedItem[];
  periods?: {
    weekly: RankingPeriodData;
    monthly: RankingPeriodData;
    allTime: RankingPeriodData;
  };
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
  onOpenGamificationGuide?: () => void;
}

export default function RankingLeaderboard({
  ranking,
  loading,
  onOpenCheckinPhoto,
  onOpenGamificationGuide,
}: RankingLeaderboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"weekly" | "monthly" | "allTime">("weekly");
  const [showFullRanking, setShowFullRanking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchingAll, setFetchingAll] = useState(false);

  // Dados do período ativo (Semana, Mês ou Geral)
  const currentPeriodData = React.useMemo(() => {
    if (ranking?.periods && ranking.periods[selectedPeriod]) {
      return ranking.periods[selectedPeriod];
    }
    return {
      top5: ranking?.top5 || [],
      allRanked: ranking?.allRanked || ranking?.top5 || [],
      userPosition: ranking?.userPosition || -1,
    };
  }, [ranking, selectedPeriod]);

  const activeTop5 = currentPeriodData.top5;
  const activeAllRanked = currentPeriodData.allRanked;
  const activeUserPos = currentPeriodData.userPosition;  if (loading) {
    return (
      <section className="mb-8 bg-white dark:bg-[#151D2F] border border-[#E2E8F0] dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <DumbbellLoading text="Carregando classificação dos Titãs..." subtext="Calculando posições e pontuações do ranking" />
      </section>
    );
  }

  if (!ranking || activeTop5.length === 0) {
    return null;
  }

  const totalParticipants = Math.max(
    ranking.totalParticipants || 0,
    activeAllRanked.length,
    activeTop5.length
  );
  const hasMoreThan5 = totalParticipants > 5 || activeAllRanked.length > 5;

  const handleToggleFullRanking = () => {
    setShowFullRanking((prev) => !prev);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const displayedList = showFullRanking
    ? activeAllRanked.slice(3)
    : activeAllRanked.slice(3, 5);

  const periodLabels = {
    weekly: "Semana Atual",
    monthly: "Mês Atual",
    allTime: "Geral",
  };

  return (
    <>
      <section className="mb-8 bg-white dark:bg-[#151D2F] border border-[#E2E8F0] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        {/* Header com Seletor de Períodos Moderno */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white leading-tight">
                  Liga dos Titãs
                </h3>
                {onOpenGamificationGuide && (
                  <button
                    type="button"
                    onClick={onOpenGamificationGuide}
                    className="p-1 rounded-lg text-slate-400 hover:text-[#2563EB] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Como funciona a pontuação e os rankings?"
                    aria-label="Ver regras da gamificação"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedPeriod === "weekly"
                  ? "Corrida Semanal • Reinicia toda segunda-feira"
                  : selectedPeriod === "monthly"
                  ? "Campeonato Mensal • Do 1º ao último dia do mês"
                  : "Ranking Histórico • Todo o XP acumulado"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
            {/* Seletor de Abas: Semana / Mês / Geral */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPeriod("weekly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === "weekly"
                    ? "bg-white dark:bg-[#1E293B] text-[#2563EB] dark:text-blue-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("monthly")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === "monthly"
                    ? "bg-white dark:bg-[#1E293B] text-[#2563EB] dark:text-blue-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Mês
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("allTime")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === "allTime"
                    ? "bg-white dark:bg-[#1E293B] text-[#2563EB] dark:text-blue-400 shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Geral
              </button>
            </div>

            {hasMoreThan5 ? (
              <button
                type="button"
                onClick={handleToggleFullRanking}
                className="text-[11px] bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/90 dark:border-blue-800/80 px-3 py-1.5 rounded-full font-bold text-[#2563EB] dark:text-blue-400 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs shrink-0"
                title={showFullRanking ? "Recolher para TOP 5" : "Ver todos os atletas no ranking"}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{totalParticipants} atletas</span>
                {showFullRanking ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            ) : (
              <span className="text-[11px] bg-[#2563EB]/5 dark:bg-blue-950/40 border border-[#2563EB]/15 dark:border-blue-900/60 px-3 py-1.5 rounded-full font-bold text-[#2563EB] dark:text-blue-400 flex items-center gap-1.5 shrink-0">
                <Users className="w-3.5 h-3.5" />
                <span>{totalParticipants} atletas</span>
              </span>
            )}
          </div>
        </div>

        {/* Pódio visual (Top 3) com Identidade Cromática Real de Medalhas */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 pb-2 border-b border-[#E2E8F0]/50 dark:border-slate-800 items-end">
          {/* 2º Lugar (Esquerda) — Prata Metálica */}
          {activeTop5[1] && (
            <div className="flex flex-col items-center text-center space-y-1.5 order-1">
              <div className="relative">
                <UserAvatar
                  name={activeTop5[1].name}
                  image={activeTop5[1].image}
                  size="lg"
                  className="border-3 border-slate-300 dark:border-slate-500 shadow-md ring-2 ring-slate-300/40 dark:ring-slate-500/40"
                />
                <span className="absolute -bottom-1.5 -right-1 bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border border-white dark:border-slate-800 shadow-sm">
                  2
                </span>
              </div>
              <div className="min-w-0 w-full">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate px-1">
                  {activeTop5[1].name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-extrabold">
                  {(activeTop5[1].displayXp ?? activeTop5[1].totalXp).toLocaleString("pt-BR")} XP
                </p>
                {activeTop5[1].weeklyCheckins && activeTop5[1].weeklyCheckins.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                    {activeTop5[1].weeklyCheckins.map((chk) => (
                      <button
                        key={chk.id}
                        type="button"
                        onClick={() =>
                          onOpenCheckinPhoto({
                            id: chk.id,
                            photoUrl: chk.photoUrl,
                            studentName: activeTop5[1].name,
                            studentImage: activeTop5[1].image,
                            dayOfWeekFull: chk.dayOfWeekFull,
                            formattedDate: chk.formattedDate,
                          })
                        }
                        className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-0.5 cursor-pointer transition-colors"
                        title={`${chk.dayOfWeekFull} (${chk.formattedDate}) - Ver foto`}
                      >
                        <Camera className="w-2.5 h-2.5" />
                        {chk.dayOfWeek}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Pilar de Prata */}
              <div className="w-full h-11 bg-gradient-to-t from-slate-200 via-slate-100 to-slate-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 rounded-t-xl border-x-2 border-t-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-xs">
                <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 font-mono flex items-center gap-0.5">
                  🥈 2º
                </span>
              </div>
            </div>
          )}

          {/* 1º Lugar (Centro) — Ouro Luminoso */}
          {activeTop5[0] && (
            <div className="flex flex-col items-center text-center space-y-1.5 order-2">
              <div className="relative">
                <UserAvatar
                  name={activeTop5[0].name}
                  image={activeTop5[0].image}
                  size="xl"
                  className="border-3 border-amber-400 dark:border-amber-500 shadow-lg ring-3 ring-amber-400/40 dark:ring-amber-500/40"
                />
                <span className="absolute -bottom-1.5 -right-1 bg-gradient-to-tr from-amber-500 to-yellow-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black border-2 border-white dark:border-slate-800 shadow-md">
                  👑
                </span>
              </div>
              <div className="min-w-0 w-full">
                <p className="text-xs font-black text-amber-700 dark:text-amber-300 truncate px-1">
                  {activeTop5[0].name}
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-extrabold">
                  {(activeTop5[0].displayXp ?? activeTop5[0].totalXp).toLocaleString("pt-BR")} XP
                </p>
                {activeTop5[0].weeklyCheckins && activeTop5[0].weeklyCheckins.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                    {activeTop5[0].weeklyCheckins.map((chk) => (
                      <button
                        key={chk.id}
                        type="button"
                        onClick={() =>
                          onOpenCheckinPhoto({
                            id: chk.id,
                            photoUrl: chk.photoUrl,
                            studentName: activeTop5[0].name,
                            studentImage: activeTop5[0].image,
                            dayOfWeekFull: chk.dayOfWeekFull,
                            formattedDate: chk.formattedDate,
                          })
                        }
                        className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/60 flex items-center gap-0.5 cursor-pointer transition-colors"
                        title={`${chk.dayOfWeekFull} (${chk.formattedDate}) - Ver foto`}
                      >
                        <Camera className="w-2.5 h-2.5" />
                        {chk.dayOfWeek}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Pilar de Ouro */}
              <div className="w-full h-16 bg-gradient-to-t from-amber-200/90 via-amber-100 to-amber-50 dark:from-amber-900/60 dark:via-amber-800/40 dark:to-amber-700/30 rounded-t-xl border-x-2 border-t-2 border-amber-400/90 dark:border-amber-600/80 flex items-center justify-center shadow-sm shadow-amber-200/50 dark:shadow-amber-950/50">
                <span className="text-xs font-black text-amber-800 dark:text-amber-200 font-mono flex items-center gap-1">
                  🥇 1º
                </span>
              </div>
            </div>
          )}

          {/* 3º Lugar (Direita) — Bronze / Cobre Autêntico */}
          {activeTop5[2] && (
            <div className="flex flex-col items-center text-center space-y-1.5 order-3">
              <div className="relative">
                <UserAvatar
                  name={activeTop5[2].name}
                  image={activeTop5[2].image}
                  size="lg"
                  className="border-3 border-[#CD7F32] shadow-sm ring-2 ring-[#CD7F32]/30"
                />
                <span className="absolute -bottom-1.5 -right-1 bg-gradient-to-tr from-[#9C5221] to-[#D97D3E] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border border-white dark:border-slate-800 shadow-sm">
                  3
                </span>
              </div>
              <div className="min-w-0 w-full">
                <p className="text-[11px] font-bold text-[#8C4315] dark:text-orange-300 truncate px-1">
                  {activeTop5[2].name}
                </p>
                <p className="text-[10px] text-[#A0522D] dark:text-orange-400 font-mono font-extrabold">
                  {(activeTop5[2].displayXp ?? activeTop5[2].totalXp).toLocaleString("pt-BR")} XP
                </p>
                {activeTop5[2].weeklyCheckins && activeTop5[2].weeklyCheckins.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-1 flex-wrap">
                    {activeTop5[2].weeklyCheckins.map((chk) => (
                      <button
                        key={chk.id}
                        type="button"
                        onClick={() =>
                          onOpenCheckinPhoto({
                            id: chk.id,
                            photoUrl: chk.photoUrl,
                            studentName: activeTop5[2].name,
                            studentImage: activeTop5[2].image,
                            dayOfWeekFull: chk.dayOfWeekFull,
                            formattedDate: chk.formattedDate,
                          })
                        }
                        className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-orange-50 dark:bg-orange-950/60 text-[#8C4315] dark:text-orange-200 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/60 flex items-center gap-0.5 cursor-pointer transition-colors"
                        title={`${chk.dayOfWeekFull} (${chk.formattedDate}) - Ver foto`}
                      >
                        <Camera className="w-2.5 h-2.5" />
                        {chk.dayOfWeek}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Pilar de Bronze */}
              <div className="w-full h-8 bg-gradient-to-t from-orange-200/80 via-orange-100/70 to-amber-50/60 dark:from-orange-950/70 dark:via-orange-900/50 dark:to-amber-900/30 rounded-t-xl border-x-2 border-t-2 border-[#CD7F32]/80 dark:border-orange-700/80 flex items-center justify-center shadow-xs">
                <span className="text-[10px] font-black text-[#8C4315] dark:text-orange-200 font-mono flex items-center gap-0.5">
                  🥉 3º
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Lista dos demais (4º em diante) */}
        {displayedList.length > 0 && (
          <div className="space-y-2 pt-1">
            {displayedList.map((user, idx) => {
              const position = idx + 4;
              const isCurrentUser = position === activeUserPos;

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 ${
                    isCurrentUser
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border-2 border-[#2563EB]/40 dark:border-blue-500/50 shadow-xs"
                      : "bg-zinc-50/80 dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-slate-700/80 hover:bg-zinc-100/50 dark:hover:bg-[#1E293B] hover:border-[#2563EB]/20 dark:hover:border-blue-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-xs font-bold w-5 text-center font-mono ${
                        isCurrentUser
                          ? "text-[#2563EB] dark:text-blue-400 font-extrabold"
                          : "text-[#94A3B8] dark:text-slate-400"
                      }`}
                    >
                      {position}º
                    </span>
                    <UserAvatar
                      name={user.name}
                      image={user.image}
                      size="sm"
                      className="border border-[#E2E8F0] dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                          {user.name}
                        </p>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[#2563EB] dark:text-blue-300 text-[9px] font-black uppercase shrink-0">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-[#94A3B8] dark:text-slate-400">
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
                              className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-0.5 cursor-pointer transition-colors"
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
                    <p className="text-xs font-extrabold text-[#2563EB] dark:text-blue-400 font-mono">
                      {(user.displayXp ?? user.totalXp).toLocaleString("pt-BR")} XP
                    </p>
                    <p className="text-[8px] text-[#94A3B8] dark:text-slate-400 font-medium">
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
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 dark:from-blue-950/40 dark:via-[#1E293B] dark:to-blue-950/40 hover:from-blue-100 hover:to-indigo-50 dark:hover:from-blue-900/50 dark:hover:to-indigo-950/50 border-2 border-blue-200/90 dark:border-blue-800/80 text-xs font-black text-[#2563EB] dark:text-blue-400 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] min-h-[48px]"
                >
                  {fetchingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#2563EB] dark:text-blue-400" />
                      <span>Carregando todos os atletas...</span>
                    </>
                  ) : showFullRanking ? (
                    <>
                      <ChevronUp className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                      <span>Mostrar apenas o TOP 5</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span>
                        Ver Ranking Completo (todos os {totalParticipants} atletas)
                      </span>
                      <ChevronDown className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="py-3 px-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99] min-h-[48px]"
                  title="Abrir ranking em modal com busca"
                >
                  <Search className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline">Buscar Atleta</span>
                  <span className="sm:hidden">Buscar</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Posição do Usuário Logado */}
        {activeUserPos > 5 && (
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-2xl text-center">
            <p className="text-xs text-[#1E40AF] dark:text-blue-300 font-bold">
              Você está na{" "}
              <span className="font-extrabold">{activeUserPos}ª</span>{" "}
              posição ({periodLabels[selectedPeriod]}).
            </p>
            <p className="text-[10px] text-[#64748B] dark:text-slate-400 mt-0.5">
              Conclua mais treinos e registre PRs para subir no ranking! ⚡
            </p>
          </div>
        )}
        {activeUserPos > 0 && activeUserPos <= 5 && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl text-center">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">
              Você está no TOP 5! Posição atual:{" "}
              <span className="font-extrabold">{activeUserPos}º Lugar</span> 🎉
            </p>
          </div>
        )}
      </section>

      {/* Modal de Classificação Completa com Busca */}
      <FullRankingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rankingList={activeAllRanked}
        userPosition={activeUserPos}
        totalParticipants={totalParticipants}
        onOpenCheckinPhoto={onOpenCheckinPhoto}
      />
    </>
  );
}
