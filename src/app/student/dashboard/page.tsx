"use client";
import BrandLogo from "@/components/BrandLogo";
import WorkoutTab from "./components/WorkoutTab";
import PartnerTab from "./components/PartnerTab";
import WeightTab from "./components/WeightTab";
import AchievementsTab from "./components/AchievementsTab";
import WeatherCard from "./components/WeatherCard";

import { getAchievementStatusHint } from "@/lib/gamification";

import React, { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dumbbell,
  LogOut,
  Loader2,
  Calendar,
  Activity,
  Play,
  Award,
  Sparkles,
  Users,
  TrendingUp,
  User,
  ArrowRight,
  RefreshCw,
  Edit,
  X,
  Bell,
  ChevronRight,
  Eye,
  Tv,
  Flame,
  Trophy,
  Shield,
  Scale,
  Zap,
  Swords,
  Lock,
  Crown,
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  progress: number;
  target: number;
  tier: number;
}

interface GamificationData {
  level: number;
  levelTitle: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXpNeeded: number;
  streak: number;
  totalSessions: number;
  prsCount: number;
  measurementsCount: number;
  achievements: Achievement[];
}



interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  sets: number;
  reps: string;
  restSeconds: number;
  method: string;
  videoUrl?: string | null;
  description?: string | null;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description: string | null;
  division: string;
  weekDays: string | null;
  exercises: Exercise[];
}

interface TrainerInfo {
  name: string;
  email: string;
}

interface Partner {
  id: string;
  name: string;
  email: string;
}

interface ComparisonData {
  myInfo: {
    name: string;
    sessionsCount: number;
    setsCount: number;
  };
  partnerInfo: {
    name: string;
    sessionsCount: number;
    setsCount: number;
  };
  sharedExercises: {
    exerciseId: string;
    name: string;
    muscleGroup: string;
    equipment: string;
  }[];
  exerciseComparison: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    myMax: number;
    partnerMax: number;
  }[];
}

const DAY_ORDER: Record<string, number> = {
  "Seg": 1,
  "Ter": 2,
  "Qua": 3,
  "Qui": 4,
  "Sex": 5,
  "Sáb": 6,
  "Dom": 7
};

function sortPlansByWeekDays(plansList: WorkoutPlan[]) {
  return [...plansList].sort((a, b) => {
    if (!a.weekDays && !b.weekDays) return 0;
    if (!a.weekDays) return 1;
    if (!b.weekDays) return -1;

    const aDays = a.weekDays.split(",").map(d => d.trim()).map(d => DAY_ORDER[d] || 999).sort((x, y) => x - y);
    const bDays = b.weekDays.split(",").map(d => d.trim()).map(d => DAY_ORDER[d] || 999).sort((x, y) => x - y);

    for (let i = 0; i < Math.max(aDays.length, bDays.length); i++) {
      const aVal = aDays[i] !== undefined ? aDays[i] : 999;
      const bVal = bDays[i] !== undefined ? bDays[i] : 999;
      if (aVal !== bVal) {
        return aVal - bVal;
      }
    }
    return 0;
  });
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados da Aba e Duelo de Parceiros
  const [activeTab, setActiveTab] = useState<"fichas" | "conquistas" | "dupla" | "peso">("fichas");
  const [selectedPlanForPreview, setSelectedPlanForPreview] = useState<WorkoutPlan | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [achievementFilter, setAchievementFilter] = useState<"all" | "unlocked" | "locked">("all");

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
  };

  const handleTabChange = (tab: "fichas" | "conquistas" | "dupla" | "peso") => {
    setActiveTab(tab);
    localStorage.setItem("student_active_tab", tab);
  };
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [partnerSearchQuery, setPartnerSearchQuery] = useState("");

  // Estados de Peso corporal
  interface WeightMeasurement {
    id: string;
    weight: number;
    date: string;
    bodyFat?: number | null;
    chest?: number | null;
    waist?: number | null;
    armLeft?: number | null;
    armRight?: number | null;
    thighLeft?: number | null;
    thighRight?: number | null;
    calfLeft?: number | null;
    calfRight?: number | null;
    photos?: string[];
  }
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [measurementsLoading, setMeasurementsLoading] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [weightError, setWeightError] = useState("");
  const [expandedMeasurementId, setExpandedMeasurementId] = useState<string | null>(null);
  const [selectedPhotoForZoom, setSelectedPhotoForZoom] = useState<string>("");

  // Estados de Notificações
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Ref para fechar notificações ao clicar fora
  const notificationRef = useRef<HTMLDivElement>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Estados para Recordes Pessoais (PRs)
  const [prs, setPrs] = useState<any[]>([]);
  const [prsLoading, setPrsLoading] = useState(true);

  // Estados de Gamificação (RPG)
  interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    unlocked: boolean;
    progress: number;
    target: number;
    tier: number;
  }
  interface GamificationData {
    level: number;
    levelTitle: string;
    totalXp: number;
    currentLevelXp: number;
    nextLevelXpNeeded: number;
    streak: number;
    totalSessions: number;
    prsCount: number;
    measurementsCount: number;
    achievements: Achievement[];
  }
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [gamificationLoading, setGamificationLoading] = useState(true);

  interface RankingUser {
    id: string;
    name: string;
    email: string;
    image: string | null;
    totalXp: number;
    level: number;
    levelTitle: string;
    totalSessions: number;
  }
  interface RankingData {
    top5: RankingUser[];
    userPosition: number;
    totalParticipants: number;
  }
  const [ranking, setRanking] = useState<RankingData | null>(null);
  const [rankingLoading, setRankingLoading] = useState(true);


  // Estados para edição de Ficha (Divisão & Dias)
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [editDivision, setEditDivision] = useState("");
  const [editWeekDays, setEditWeekDays] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  const handleOpenEdit = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setEditDivision(plan.division);
    setEditWeekDays(plan.weekDays ? plan.weekDays.split(",") : []);
    setEditError("");
  };

  const handleToggleEditDay = (day: string) => {
    if (editWeekDays.includes(day)) {
      setEditWeekDays(editWeekDays.filter((d) => d !== day));
    } else {
      setEditWeekDays([...editWeekDays, day]);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    if (!editDivision.trim()) {
      setEditError("A divisão não pode ser vazia.");
      return;
    }
    
    setSavingEdit(true);
    setEditError("");
    try {
      const response = await fetch(`/api/student/workout-plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          division: editDivision,
          weekDays: editWeekDays.length > 0 ? editWeekDays.join(",") : null,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        const updatedPlans = plans.map((p) => p.id === editingPlan.id ? { ...p, division: updated.division, weekDays: updated.weekDays } : p);
        setPlans(sortPlansByWeekDays(updatedPlans));
        setEditingPlan(null);
      } else {
        const data = await response.json();
        setEditError(data.error || "Erro ao salvar alterações.");
      }
    } catch (err) {
      setEditError("Erro ao salvar alterações.");
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/student/workout-plans");
        if (response.ok) {
          const data = await response.json();
          setPlans(sortPlansByWeekDays(data.plans));
          setTrainer(data.trainer);
        }
      } catch (error) {
        console.error("Erro ao buscar treinos:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPrs = async () => {
      try {
        const response = await fetch("/api/student/prs");
        if (response.ok) {
          const data = await response.json();
          setPrs(data);
        }
      } catch (error) {
        console.error("Erro ao buscar PRs:", error);
      } finally {
        setPrsLoading(false);
      }
    };

    const fetchGamification = async () => {
      try {
        const response = await fetch("/api/student/gamification");
        if (response.ok) {
          const data = await response.json();
          setGamification(data);
          
          // Auto-select the first tier that has locked achievements (where the user is currently progressing)
          const firstLockedTier = data.achievements.find((a: Achievement) => !a.unlocked)?.tier || 4;
          setSelectedTier(firstLockedTier);
        }
      } catch (error) {
        console.error("Erro ao buscar dados de gamificação:", error);
      } finally {
        setGamificationLoading(false);
      }
    };

    const fetchRanking = async () => {
      try {
        const response = await fetch("/api/student/ranking");
        if (response.ok) {
          const data = await response.json();
          setRanking(data);
        }
      } catch (error) {
        console.error("Erro ao buscar ranking:", error);
      } finally {
        setRankingLoading(false);
      }
    };

    fetchPlans();
    fetchPrs();
    fetchGamification();
    fetchRanking();
  }, []);

  useEffect(() => {
    const savedTab = localStorage.getItem("student_active_tab");
    if (savedTab && ["fichas", "conquistas", "dupla", "peso"].includes(savedTab)) {
      setActiveTab(savedTab as "fichas" | "conquistas" | "dupla" | "peso");
    }
  }, []);

  // Buscar lista de parceiros ao carregar a aba de dupla
  useEffect(() => {
    if (activeTab === "dupla" && partners.length === 0) {
      const fetchPartners = async () => {
        try {
          const response = await fetch("/api/student/partner-comparison");
          if (response.ok) {
            const data = await response.json();
            setPartners(data);
          }
        } catch (error) {
          console.error("Erro ao buscar parceiros:", error);
        }
      };
      fetchPartners();
    }
  }, [activeTab, partners]);

  // Carregar dados de comparação ao selecionar um parceiro
  const handleSelectPartner = async (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    if (!partnerId) {
      setComparison(null);
      return;
    }

    setComparisonLoading(true);
    try {
      const response = await fetch("/api/student/partner-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId }),
      });
      if (response.ok) {
        const data = await response.json();
        setComparison(data);
      }
    } catch (error) {
      console.error("Erro ao buscar comparação:", error);
    } finally {
      setComparisonLoading(false);
    }
  };

  const [weightGoal, setWeightGoal] = useState<string>("EMAGRECER");

  const fetchMeasurements = async () => {
    setMeasurementsLoading(true);
    try {
      const response = await fetch("/api/student/measurements");
      if (response.ok) {
        const data = await response.json();
        setMeasurements(data.measurements || []);
        setWeightGoal(data.weightGoal || "EMAGRECER");
      }
    } catch (err) {
      console.error("Erro ao carregar peso:", err);
    } finally {
      setMeasurementsLoading(false);
    }
  };

  const handleUpdateWeightGoal = async (goal: string) => {
    try {
      const response = await fetch("/api/student/measurements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightGoal: goal }),
      });
      if (response.ok) {
        const data = await response.json();
        setWeightGoal(data.weightGoal);
      }
    } catch (err) {
      console.error("Erro ao atualizar objetivo de peso:", err);
    }
  };

  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(Number(newWeight))) {
      setWeightError("Insira um valor de peso válido.");
      return;
    }
    setSavingWeight(true);
    setWeightError("");
    try {
      const response = await fetch("/api/student/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: Number(newWeight),
          date: newWeightDate,
        }),
      });
      if (response.ok) {
        setNewWeight("");
        fetchMeasurements();
      } else {
        const data = await response.json();
        setWeightError(data.error || "Erro ao salvar.");
      }
    } catch (err) {
      setWeightError("Erro de conexão.");
    } finally {
      setSavingWeight(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    } catch (err) {
      console.error("Erro ao buscar notificações:", err);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Erro ao ler notificações:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "peso") {
      fetchMeasurements();
      const today = new Date().toISOString().split("T")[0];
      setNewWeightDate(today);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fechar notificações ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const filteredPartners = partners.filter((p) => {
    const query = partnerSearchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-[#0F172A]">
      {/* Header */}
      <header className="border-b border-[#E2E8F0]/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <BrandLogo size={36} />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-[#0F172A]">
                {session?.user?.name || "Aluno"}
              </p>
              <p className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider">
                Atleta
              </p>
            </div>

            {/* Bell Icon & Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadCount > 0) {
                    handleMarkNotificationsRead();
                  }
                }}
                className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/30 hover:bg-[#00C2FF]/5 text-[#94A3B8] hover:text-[#2563EB] transition-all cursor-pointer relative"
                title="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                    <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Notificações</h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[#94A3B8] hover:text-[#0F172A] text-xs font-semibold"
                    >
                      Fechar
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-[11px] text-[#94A3B8] text-center py-4">Nenhuma notificação por enquanto.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`p-2.5 rounded-xl border text-[11px] space-y-1 transition-all ${n.read ? "bg-zinc-50 border-transparent text-[#94A3B8]" : "bg-blue-50/50 border-[#2563EB]/10 text-[#0F172A] font-semibold"}`}>
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-[#2563EB]">{n.title}</span>
                            <span className="text-[9px] text-[#94A3B8] font-normal whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="leading-relaxed font-normal">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-red-500/30 hover:bg-red-500/5 text-[#94A3B8] hover:text-red-600 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        
        {/* Welcome Block */}
        <section className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0]/80 text-[#2563EB] text-xs font-semibold mb-4 tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-[#2563EB]/10" /> Hora do show
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Pronto para treinar hoje, <span className="text-[#2563EB]">{session?.user?.name?.split(" ")[0]}</span>?
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3">
            {trainer && (
              <p className="text-xs text-[#94A3B8]">
                Assessoria Esportiva: <span className="text-[#0F172A] font-semibold">{trainer.name}</span>
              </p>
            )}
          </div>
        </section>

        {/* Clima Atual */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <WeatherCard />
        </section>

        {/* Painel RPG de Nível, XP e Streak */}
        {gamificationLoading ? (
          <section className="mb-8 p-6 rounded-2xl bg-slate-900 shadow-xl relative overflow-hidden animate-pulse">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800"></div>
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-slate-800 rounded"></div>
                  <div className="h-3 w-24 bg-slate-800 rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2.5 rounded-xl w-full sm:w-40">
                  <div className="h-8 w-8 bg-slate-700 rounded-lg shrink-0"></div>
                  <div className="space-y-1 w-full">
                    <div className="h-3 w-16 bg-slate-700 rounded"></div>
                    <div className="h-4 w-12 bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : gamification && (
          <section className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-zinc-950 text-white shadow-xl relative overflow-hidden border border-white/5 animate-fade-in">
            {/* Elemento decorativo de luz de fundo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              
              {/* Informações do Nível */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#00C2FF] flex flex-col items-center justify-center shadow-lg shadow-blue-500/20 border border-white/20">
                  <span className="text-[10px] uppercase font-bold text-blue-100 leading-none">Nível</span>
                  <span className="text-2xl font-black font-mono leading-none mt-1">{gamification.level}</span>
                </div>
                <div>
                  <h3 className="font-display text-base font-extrabold tracking-tight bg-gradient-to-r from-blue-100 to-cyan-100 bg-clip-text text-transparent">
                    {gamification.levelTitle}
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{gamification.totalXp} XP Acumulados</span>
                  </p>
                </div>
              </div>

              {/* Estatísticas de Gamificação */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Constância */}
                <div className="flex-1 md:flex-none p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${gamification.streak > 0 ? "bg-amber-500/10 text-amber-400 animate-pulse" : "bg-zinc-800 text-zinc-500"}`}>
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-zinc-400 block tracking-wider">Semanas Seguidas</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {gamification.streak} {gamification.streak === 1 ? "semana" : "semanas"}
                    </span>
                  </div>
                </div>

                {/* Total Treinos */}
                <div className="flex-1 md:flex-none p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-semibold text-zinc-400 block tracking-wider">Treinos</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {gamification.totalSessions} conclusões
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de Progresso de Nível (XP) */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-zinc-400">
                <span>Progresso para o Nível {gamification.level + 1}</span>
                <span className="font-mono">{gamification.currentLevelXp} / {gamification.nextLevelXpNeeded} XP</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#00C2FF] transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                  style={{ width: `${Math.min(100, (gamification.currentLevelXp / gamification.nextLevelXpNeeded) * 100)}%` }}
                />
              </div>
            </div>
          </section>
        )}

        {/* Abas */}
        <div className="hidden sm:flex border-b border-[#E2E8F0] mb-6">
          <button
            onClick={() => handleTabChange("fichas")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "fichas"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span><span className="hidden sm:inline">Minhas </span>Fichas</span>
          </button>
          <button
            onClick={() => handleTabChange("dupla")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "dupla"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Dupla<span className="hidden sm:inline"> 🤝</span></span>
          </button>
          <button
            onClick={() => handleTabChange("peso")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "peso"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Peso<span className="hidden sm:inline"> ⚖️</span></span>
          </button>
          <button
            onClick={() => handleTabChange("conquistas")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "conquistas"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Conquistas<span className="hidden sm:inline"> 🏆</span></span>
          </button>
        </div>

        {/* Aba 1: Fichas de Treino */}
        {activeTab === "fichas" && <WorkoutTab {...{
  loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
  partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
  measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,
  selectedTier, setSelectedTier, achievementFilter, setAchievementFilter
}} />}


        {/* Aba 2: Treino em Dupla (Comparação) */}
        {activeTab === "dupla" && <PartnerTab {...{
  loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
  partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
  measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,
  selectedTier, setSelectedTier, achievementFilter, setAchievementFilter
}} />}

        {/* Aba 3: Meu Peso */}
        {activeTab === "peso" && <WeightTab {...{
  loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
  partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
  measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,
  selectedTier, setSelectedTier, achievementFilter, setAchievementFilter, 
}} />}


        {/* Aba de Conquistas */}
        {activeTab === "conquistas" && <AchievementsTab {...{
  loading, plans, prsLoading, prs, gamificationLoading, gamification, rankingLoading, ranking, handleOpenEdit, setSelectedPlanForPreview, handleTabChange,
  partnerSearchQuery, setPartnerSearchQuery, partners, filteredPartners, selectedPartnerId, handleSelectPartner, comparisonLoading, comparison,
  measurements, measurementsLoading, newWeight, setNewWeight, newWeightDate, setNewWeightDate, savingWeight, handleSaveWeight, selectedPhotoForZoom, setSelectedPhotoForZoom,
  selectedTier, setSelectedTier, achievementFilter, setAchievementFilter
}} />}
      </main>

      {/* Modal de Edição de Ficha */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl relative border border-[#E2E8F0] animate-scale-up">
            {/* Fechar */}
            <button
              onClick={() => setEditingPlan(null)}
              className="absolute top-4 right-4 p-2 rounded-lg border border-[#E2E8F0] text-[#94A3B8] hover:text-[#0F172A] hover:bg-zinc-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display text-lg font-bold text-[#0F172A] mb-2 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#2563EB]" /> Editar Divisão e Dias
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-6">
              Ajuste o nome/letra da divisão de treino e marque quais dias da semana você pretende realizá-lo.
            </p>

            {editError && (
              <p className="text-xs font-semibold text-red-500 bg-red-500/5 border border-red-500/20 p-3 rounded-xl mb-4">
                {editError}
              </p>
            )}

            <div className="space-y-5">
              {/* Campo Divisão */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Letra / Nome da Divisão
                </label>
                <input
                  type="text"
                  value={editDivision}
                  onChange={(e) => setEditDivision(e.target.value)}
                  placeholder="Ex: A, B, Superior, Push"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                />
              </div>

              {/* Dias da Semana */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Dias da Semana Planejados
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => {
                    const isSelected = editWeekDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleEditDay(day)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-[#2563EB] border-[#2563EB] text-white shadow-sm shadow-blue-500/10"
                            : "bg-white border-[#E2E8F0] text-[#475569] hover:border-zinc-300"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-3 border-t border-[#E2E8F0] mt-6">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] hover:bg-zinc-100/50 text-[#475569] font-bold text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] disabled:bg-opacity-50 disabled:pointer-events-none text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização da Ficha Completa */}
      {selectedPlanForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl relative border border-[#E2E8F0] animate-scale-up flex flex-col max-h-[90vh]">
            {/* Fechar */}
            <button
              onClick={() => setSelectedPlanForPreview(null)}
              className="absolute top-4 right-4 p-2 rounded-lg border border-[#E2E8F0] text-[#94A3B8] hover:text-[#0F172A] hover:bg-zinc-100 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] bg-blue-55 border border-blue-200 px-2 py-0.5 rounded font-bold text-[#2563EB] uppercase">
                Visualizando Ficha
              </span>
              <h3 className="font-display text-xl font-extrabold text-[#0F172A] mt-1 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#2563EB]" /> {selectedPlanForPreview.name}
              </h3>
              {selectedPlanForPreview.description && (
                <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                  {selectedPlanForPreview.description}
                </p>
              )}
            </div>

            {/* Lista de Exercícios */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2 my-2 border-y border-[#E2E8F0]/80">
              {selectedPlanForPreview.exercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="p-3 bg-zinc-50 border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#2563EB]/20 hover:bg-[#2563EB]/1 shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4.5 h-4.5 rounded-full bg-zinc-200 text-[#0F172A] text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-[#0F172A]">{ex.name}</p>
                    </div>
                    <p className="text-[10px] text-[#94A3B8] pl-6">
                      {ex.muscleGroup} • {ex.equipment}
                    </p>
                    {ex.description && (
                      <p className="text-[10px] text-[#94A3B8] pl-6 italic line-clamp-1 hover:line-clamp-none transition-all duration-300">
                        Obs: {ex.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-6 sm:pl-0">
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#0F172A]">{ex.sets}x{ex.reps}</p>
                      <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">{ex.method}</p>
                      {ex.restSeconds > 0 && (
                        <p className="text-[9px] text-[#94A3B8] font-medium font-mono">Descanso: {ex.restSeconds}s</p>
                      )}
                    </div>
                    {(ex.videoUrl || ex.gifUrl) && (
                      <button
                        type="button"
                        onClick={() => setActiveVideoUrl(ex.gifUrl || ex.videoUrl || null)}
                        className="p-2.5 rounded-lg border border-[#E2E8F0] hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 text-[#2563EB] transition-all cursor-pointer animate-pulse-subtle"
                        title="Ver execução do exercício"
                      >
                        <Tv className="w-4 h-4" />
                      </button>
                    )}

                  </div>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-3 border-t border-[#E2E8F0] mt-3">
              <button
                type="button"
                onClick={() => setSelectedPlanForPreview(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] hover:bg-zinc-100/50 text-[#475569] font-bold text-xs transition-all cursor-pointer"
              >
                Voltar
              </button>
              <Link
                href={`/student/workout-session/${selectedPlanForPreview.id}`}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10"
              >
                <Play className="w-4 h-4 fill-white stroke-[3px]" />
                Iniciar Sessão de Treino
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Player de Vídeo Inline (Overlay) */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative border border-zinc-800 animate-scale-up">
            {/* Botão de Fechar */}
            <button
              onClick={() => setActiveVideoUrl(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-black/60 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
              title="Fechar vídeo"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Container Iframe Proporcional 16:9 */}
            <div className="aspect-video w-full bg-black">
              {activeVideoUrl?.endsWith('.gif') ? (
                <img src={activeVideoUrl} alt="Execução" className="w-full h-full object-contain bg-black" />
              ) : getYouTubeEmbedUrl(activeVideoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideoUrl) || ""}
                  title="Video Player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                  <Tv className="w-12 h-12 text-zinc-600 mb-3" />
                  <p className="text-sm font-semibold">Não foi possível carregar o vídeo inline.</p>
                  <a
                    href={activeVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    Abrir em nova aba externa <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Zoom Foto */}
      {selectedPhotoForZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-sm max-h-[85vh] w-full flex items-center justify-center animate-scale-up">
            <button
              onClick={() => setSelectedPhotoForZoom("")}
              className="absolute -top-12 right-0 p-2 rounded-lg bg-white hover:bg-zinc-800 text-[#94A3B8] hover:text-white transition-all cursor-pointer border border-[#E2E8F0]"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhotoForZoom}
              alt="Medida Ampliada"
              className="max-w-full max-h-[75vh] rounded-2xl object-contain border border-[#E2E8F0]"
            />
          </div>
        </div>
      )}


      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-[#E2E8F0]/80 pb-[safe-area-inset-bottom] shadow-[0_-4px_24px_rgba(0,0,0,0.04)] select-none">
        <div className="flex items-center justify-around h-16">
          <button
            onClick={() => handleTabChange("fichas")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-bold transition-all ${
              activeTab === "fichas" ? "text-[#2563EB]" : "text-[#94A3B8]"
            }`}
          >
            <Dumbbell className={`w-5 h-5 transition-transform duration-300 ${activeTab === "fichas" ? "scale-110 text-[#2563EB]" : "text-[#94A3B8]"}`} />
            <span>Treinos</span>
          </button>
          <button
            onClick={() => handleTabChange("dupla")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-bold transition-all ${
              activeTab === "dupla" ? "text-[#2563EB]" : "text-[#94A3B8]"
            }`}
          >
            <Users className={`w-5 h-5 transition-transform duration-300 ${activeTab === "dupla" ? "scale-110 text-[#2563EB]" : "text-[#94A3B8]"}`} />
            <span>Dupla</span>
          </button>
          <button
            onClick={() => handleTabChange("peso")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-bold transition-all ${
              activeTab === "peso" ? "text-[#2563EB]" : "text-[#94A3B8]"
            }`}
          >
            <TrendingUp className={`w-5 h-5 transition-transform duration-300 ${activeTab === "peso" ? "scale-110 text-[#2563EB]" : "text-[#94A3B8]"}`} />
            <span>Peso</span>
          </button>
          <button
            onClick={() => handleTabChange("conquistas")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-bold transition-all ${
              activeTab === "conquistas" ? "text-[#2563EB]" : "text-[#94A3B8]"
            }`}
          >
            <Trophy className={`w-5 h-5 transition-transform duration-300 ${activeTab === "conquistas" ? "scale-110 text-[#2563EB]" : "text-[#94A3B8]"}`} />
            <span>Conquistas</span>
          </button>
        </div>
      </div>

    </div>
  );
}
