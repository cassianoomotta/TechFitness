"use client";
import BrandLogo from "@/components/BrandLogo";

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

const TIER_CONFIG: Record<number, { label: string; sublabel: string; gradient: string; borderColor: string; bgColor: string; textColor: string; iconBg: string }> = {
  1: {
    label: "Primeiros Passos",
    sublabel: "O início de toda grande jornada",
    gradient: "from-emerald-500 to-teal-600",
    borderColor: "border-emerald-300/40",
    bgColor: "bg-emerald-50/30",
    textColor: "text-emerald-700",
    iconBg: "bg-emerald-500",
  },
  2: {
    label: "Criando o Hábito",
    sublabel: "Disciplina transforma corpo e mente",
    gradient: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-300/40",
    bgColor: "bg-blue-50/30",
    textColor: "text-blue-700",
    iconBg: "bg-blue-500",
  },
  3: {
    label: "Evolução Real",
    sublabel: "Os resultados começam a aparecer",
    gradient: "from-violet-500 to-purple-600",
    borderColor: "border-violet-300/40",
    bgColor: "bg-violet-50/30",
    textColor: "text-violet-700",
    iconBg: "bg-violet-500",
  },
  4: {
    label: "Elite & Lenda",
    sublabel: "Poucos chegam. Você está entre os melhores",
    gradient: "from-amber-500 to-orange-600",
    borderColor: "border-amber-300/40",
    bgColor: "bg-amber-50/30",
    textColor: "text-amber-700",
    iconBg: "bg-amber-500",
  },
};

function getAchievementIcon(iconName: string, unlocked: boolean, size: string = "w-7 h-7") {
  const colorClass = unlocked ? "text-white" : "text-zinc-400";
  const props = { className: `${size} ${colorClass}` };
  switch (iconName) {
    case "Play":
      return <Play {...props} className={props.className + " fill-current"} />;
    case "Award":
      return <Award {...props} />;
    case "Zap":
      return <Zap {...props} className={props.className + " fill-current"} />;
    case "Scale":
      return <Scale {...props} />;
    case "Flame":
      return <Flame {...props} className={props.className + " fill-current"} />;
    case "ShieldAlert":
      return <Shield {...props} />;
    case "Sword":
      return <Swords {...props} />;
    case "Crown":
      return <Crown {...props} />;
    case "Trophy":
      return <Trophy {...props} />;
    default:
      return <Trophy {...props} />;
  }
}

function getAchievementStatusHint(achievement: Achievement, currentValues: { sessions: number, prs: number, measurements: number, streak: number }) {
  if (achievement.unlocked) return "Conquista desbloqueada! XP adicionado à sua conta.";
  
  const remaining = achievement.target - achievement.progress;
  
  switch (achievement.id) {
    case "first_step":
      return `Falta apenas ${remaining} treino para iniciar sua jornada!`;
    case "pr_pioneer":
      return `Falta registrar seu primeiro recorde pessoal de carga (PR) em qualquer exercício!`;
    case "body_awareness":
      return `Registre seu peso corporal 1 vez na aba "Meu Peso" para desbloquear.`;
    case "iron_consistency":
      return `Falta(m) ${remaining} treino(s) completo(s) para alcançar o hábito de aço.`;
    case "streak_fire":
      return `Treine por mais ${remaining} semana(s) consecutivas para desbloquear Frequência Semanal.`;
    case "eagle_eye":
      return `Registre seu peso corporal mais ${remaining} vez(es) na aba "Meu Peso".`;
    case "warrior_path":
      return `Falta(m) ${remaining} treino(s) completo(s) para trilhar o Caminho do Guerreiro.`;
    case "titan_strength":
      return `Bata recordes de carga em mais ${remaining} exercício(s) diferente(s).`;
    case "inferno_streak":
      return `Mantenha o ritmo! Treine por mais ${remaining} semana(s) consecutivas para desbloquear Constância de Titã.`;
    case "centurion":
      return `Falta(m) ${remaining} treino(s) completo(s) para se tornar um Centurião.`;
    case "pr_machine":
      return `Bata recordes de carga em mais ${remaining} exercício(s) para se tornar uma Máquina de PRs.`;
    case "olympus_legend":
      return `Falta(m) ${remaining} treino(s) para subir ao topo e se tornar uma Lenda do Olimpo!`;
    default:
      return `Falta(m) ${remaining} para atingir a meta de ${achievement.target}.`;
  }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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

        {/* Painel RPG de Nível, XP e Streak */}
        {!gamificationLoading && gamification && (
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
        <div className="flex border-b border-[#E2E8F0] mb-6">
          <button
            onClick={() => handleTabChange("fichas")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "fichas"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            Minhas Fichas
          </button>
          <button
            onClick={() => handleTabChange("dupla")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "dupla"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
            }`}
          >
            <Users className="w-4 h-4" />
            Treino em Dupla 🤝
          </button>
          <button
            onClick={() => handleTabChange("peso")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "peso"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Meu Peso ⚖️
          </button>
          <button
            onClick={() => handleTabChange("conquistas")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "conquistas"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-[#94A3B8] hover:text-[#94A3B8]"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Conquistas 🏆
          </button>
        </div>

        {/* Aba 1: Fichas de Treino */}
        {activeTab === "fichas" && (
          <>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-sm">Carregando seus treinos...</p>
              </div>
            ) : plans.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center text-[#94A3B8]">
                <Dumbbell className="w-12 h-12 mx-auto text-[#475569] mb-4" />
                <p className="text-base font-semibold text-zinc-850">Nenhum treino atribuído</p>
                <p className="text-xs mt-1">Seu personal trainer ainda não cadastrou nenhuma ficha de treino para você.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80 flex flex-col justify-between group hover:border-[#2563EB]/30 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                            {plan.name}
                          </h4>
                          <button
                            onClick={() => handleOpenEdit(plan)}
                            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#2563EB]/5 transition-all cursor-pointer"
                            title="Editar divisão e dias"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {plan.description && (
                          <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{plan.description}</p>
                        )}
                        {plan.weekDays && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {plan.weekDays.split(",").map((day) => (
                              <span
                                key={day}
                                className="text-[9px] font-bold bg-[#2563EB]/5 text-[#2563EB] px-1.5 py-0.5 rounded border border-[#2563EB]/10"
                              >
                                {day}
                              </span>
                            ))}
                          </div>
                        )}
                        {!plan.weekDays && (
                          <p className="text-[10px] text-[#94A3B8] mt-1.5 italic">Nenhum dia da semana definido</p>
                        )}
                      </div>

                      <span className="text-[10px] bg-white border border-[#E2E8F0] px-2 py-1 rounded font-bold text-[#94A3B8] w-fit sm:self-start">
                        {plan.exercises.length} Exercícios
                      </span>
                    </div>

                    {/* Exercícios Preview */}
                    <div className="space-y-2 mb-6 border-y border-[#E2E8F0]/60 py-4">
                      {plan.exercises.slice(0, 3).map((ex) => (
                        <div key={ex.id} className="flex justify-between items-center text-xs">
                          <span className="text-[#475569] font-medium">{ex.name}</span>
                          <span className="text-[#94A3B8]">
                            {ex.sets}x{ex.reps} • {ex.method}
                          </span>
                        </div>
                      ))}
                      {plan.exercises.length > 3 && (
                        <p className="text-[10px] text-[#94A3B8] text-center pt-1 font-semibold">
                          + {plan.exercises.length - 3} exercícios na ficha
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanForPreview(plan)}
                        className="flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] hover:bg-zinc-50 text-[#0F172A] font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#94A3B8]" />
                        Visualizar Exercícios
                      </button>
                      <Link
                        href={`/student/workout-session/${plan.id}`}
                        className="flex-1 sm:flex-[1.5] py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 active:scale-[0.98]"
                      >
                        <Play className="w-4 h-4 fill-white stroke-[3px]" />
                        Iniciar Sessão de Treino
                      </Link>
                    </div>
                  </div>
                ))}

                {/* Recordes Pessoais (PRs) */}
                <div className="bg-white border border-[#E2E8F0]/85 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Recordes de Carga (PRs)
                    </h3>
                    <span className="text-[10px] bg-amber-50 border border-amber-250 px-2 py-0.5 rounded font-bold text-amber-700">
                      Exercícios Concluídos
                    </span>
                  </div>

                  {prsLoading ? (
                    <div className="flex items-center justify-center py-6 text-[#94A3B8]">
                      <Loader2 className="w-5 h-5 animate-spin text-[#2563EB] mr-2" />
                      <span className="text-xs">Carregando seus recordes...</span>
                    </div>
                  ) : prs.length === 0 ? (
                    <p className="text-xs text-[#94A3B8] text-center py-6 italic">
                      Você ainda não concluiu nenhum exercício para registrar recordes. Complete seu primeiro treino!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                      {prs.map((pr) => (
                        <div key={pr.exerciseId} className="p-3 bg-zinc-50 border border-[#E2E8F0] rounded-xl flex items-center justify-between gap-3 hover:border-amber-200 hover:bg-amber-50/10 transition-all">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0F172A] truncate">{pr.name}</p>
                            <p className="text-[9px] text-[#94A3B8] mt-0.5">{pr.muscleGroup} • {pr.equipment}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-extrabold text-amber-600 font-mono">{pr.maxWeight} kg</p>
                            <p className="text-[9px] text-[#94A3B8] font-medium mt-0.5">{pr.reps} reps</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                 </div>

                {/* Conquistas / Badges RPG (Preview) */}
                {!gamificationLoading && gamification && (
                  <div className="bg-white border border-[#E2E8F0]/85 rounded-2xl p-6 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Conquistas & Condecorações
                      </h3>
                      <span className="text-[10px] bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded font-bold text-emerald-700">
                        {gamification.achievements.filter(a => a.unlocked).length} / {gamification.achievements.length} Desbloqueadas
                      </span>
                    </div>

                    {/* Preview: mostra as 4 conquistas mais relevantes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(() => {
                        const unlocked = gamification.achievements.filter(a => a.unlocked);
                        const locked = gamification.achievements.filter(a => !a.unlocked);
                        // Show last 2 unlocked + next 2 to unlock
                        const preview = [
                          ...unlocked.slice(-2),
                          ...locked.slice(0, Math.max(0, 4 - Math.min(unlocked.length, 2))),
                        ].slice(0, 4);
                        
                        return preview.map((achievement) => {
                          const IconComponent = () => {
                            const props = { className: `w-6 h-6 ${achievement.unlocked ? "text-amber-500" : "text-[#94A3B8]"}` };
                            switch (achievement.icon) {
                              case "Play":
                                return <Play {...props} className={props.className + " fill-current"} />;
                              case "Zap":
                                return <Zap {...props} className={props.className + " fill-current"} />;
                              case "Scale":
                                return <Scale {...props} />;
                              case "Flame":
                                return <Flame {...props} className={props.className + " fill-current"} />;
                              case "ShieldAlert":
                                return <Shield {...props} />;
                              default:
                                return <Trophy {...props} />;
                            }
                          };

                          const percent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));

                          return (
                            <div 
                              key={achievement.id} 
                              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all duration-300 ${
                                achievement.unlocked 
                                  ? "bg-amber-50/20 border-amber-200/60 shadow-sm shadow-amber-500/5 hover:border-amber-300" 
                                  : "bg-zinc-50 border-[#E2E8F0] opacity-80"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl flex-shrink-0 transition-transform duration-300 ${
                                  achievement.unlocked 
                                    ? "bg-amber-100/50 scale-105 border border-amber-200" 
                                    : "bg-zinc-200/50 border border-[#E2E8F0]"
                                }`}>
                                  <IconComponent />
                                </div>
                                <div className="min-w-0">
                                  <h4 className={`text-xs font-bold truncate ${achievement.unlocked ? "text-[#0F172A]" : "text-[#475569]"}`}>
                                    {achievement.title}
                                  </h4>
                                  <p className="text-[10px] text-[#94A3B8] leading-tight mt-0.5">
                                    {achievement.description}
                                  </p>
                                </div>
                              </div>

                              {/* Progresso de Desbloqueio */}
                              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-900/10">
                                <div className="flex justify-between items-center text-[8px] text-[#94A3B8] font-bold">
                                  <span className={achievement.unlocked ? "text-amber-700" : ""}>
                                    {achievement.unlocked ? "DESBLOQUEADA" : "EM PROGRESSO"}
                                  </span>
                                  <span>{achievement.progress} / {achievement.target}</span>
                                </div>
                                <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      achievement.unlocked 
                                        ? "bg-amber-500" 
                                        : "bg-blue-500"
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    {/* CTA — Ver Jornada Completa */}
                    <button
                      onClick={() => handleTabChange("conquistas")}
                      className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-slate-900 to-zinc-950 hover:from-slate-800 hover:to-zinc-900 text-white font-bold text-xs transition-all duration-300 shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 cursor-pointer active:scale-[0.98] group"
                    >
                      <Trophy className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      Ver Jornada Completa de Conquistas
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Ranking de Alunos (Top 5) */}
                {!rankingLoading && ranking && (
                  <div className="bg-white border border-[#E2E8F0]/85 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Liga dos Titãs — Ranking Geral
                      </h3>
                      <span className="text-[10px] bg-[#2563EB]/5 border border-[#2563EB]/15 px-2 py-0.5 rounded font-bold text-[#2563EB]">
                        {ranking.totalParticipants} atletas ativos
                      </span>
                    </div>

                    {/* Pódio visual (Top 3) */}
                    <div className="grid grid-cols-3 gap-3 pt-4 pb-2 border-b border-[#E2E8F0]/50 items-end">
                      {/* 2º Lugar (Esquerda) */}
                      {ranking.top5[1] && (
                        <div className="flex flex-col items-center text-center space-y-1.5 order-1">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-bold text-slate-500 overflow-hidden shadow-sm">
                              {ranking.top5[1].image ? (
                                <img src={ranking.top5[1].image} alt={ranking.top5[1].name} className="w-full h-full object-cover" />
                              ) : (
                                ranking.top5[1].name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="absolute -bottom-1.5 -right-1 bg-slate-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-extrabold border border-white">
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
                            <div className="w-15 h-15 rounded-full bg-amber-50 border-3 border-amber-400 flex items-center justify-center font-bold text-amber-700 overflow-hidden shadow-md">
                              {ranking.top5[0].image ? (
                                <img src={ranking.top5[0].image} alt={ranking.top5[0].name} className="w-full h-full object-cover" />
                              ) : (
                                ranking.top5[0].name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="absolute -bottom-1.5 -right-1 bg-amber-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-extrabold border-2 border-white">
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
                            <div className="w-12 h-12 rounded-full bg-amber-50/50 border-2 border-amber-600/50 flex items-center justify-center font-bold text-amber-800 overflow-hidden shadow-sm">
                              {ranking.top5[2].image ? (
                                <img src={ranking.top5[2].image} alt={ranking.top5[2].name} className="w-full h-full object-cover" />
                              ) : (
                                ranking.top5[2].name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="absolute -bottom-1.5 -right-1 bg-amber-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-extrabold border border-white">
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
                          </div>
                          <div className="w-full h-7 bg-amber-100/10 rounded-t-lg border-x border-t border-amber-200/30 flex items-center justify-center">
                            <span className="text-[9px] font-extrabold text-amber-700/70 font-mono">3º</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lista dos demais (4º e 5º) */}
                    {(ranking.top5[3] || ranking.top5[4]) && (
                      <div className="space-y-2 pt-2">
                        {ranking.top5.slice(3, 5).map((user, idx) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 bg-zinc-50 border border-[#E2E8F0] rounded-xl hover:bg-zinc-100/30 hover:border-[#2563EB]/15 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[#94A3B8] w-4 text-center">
                                {idx + 4}
                              </span>
                              <div className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center font-bold text-xs text-[#475569] overflow-hidden">
                                {user.image ? (
                                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  user.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-[#0F172A] truncate">
                                  {user.name}
                                </p>
                                <p className="text-[9px] text-[#94A3B8]">
                                  Lvl {user.level} • {user.levelTitle}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-extrabold text-[#2563EB] font-mono">
                                {user.totalXp} XP
                              </p>
                              <p className="text-[8px] text-[#94A3B8] font-medium">
                                {user.totalSessions} treinos
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Posição do Usuário Logado */}
                    {ranking.userPosition > 5 && (
                      <div className="p-3 bg-[#2563EB]/5 border border-[#2563EB]/10 rounded-xl text-center">
                        <p className="text-xs text-[#1E40AF] font-bold">
                          Você está na <span className="font-extrabold">{ranking.userPosition}ª</span> posição global.
                        </p>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">
                          Conclua mais treinos e registre PRs para subir no ranking! ⚡
                        </p>
                      </div>
                    )}
                    {ranking.userPosition > 0 && ranking.userPosition <= 5 && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                        <p className="text-xs text-emerald-700 font-bold">
                          Você está no TOP 5! Posição atual: <span className="font-extrabold">{ranking.userPosition}º Lugar</span> 🎉
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}


        {/* Aba 2: Treino em Dupla (Comparação) */}
        {activeTab === "dupla" && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#2563EB]" /> Comparar Desempenho (Treino em Dupla)
              </h3>
              <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
                Selecione um parceiro de treino da mesma assessoria para comparar seu volume, consistência e recordes de carga em tempo real!
              </p>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Buscar Parceiro (Nome ou E-mail)</label>
                  <input
                    type="text"
                    placeholder="Digite o nome ou e-mail..."
                    value={partnerSearchQuery}
                    onChange={(e) => setPartnerSearchQuery(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Escolha seu Parceiro de Treino</label>
                  {partners.length === 0 ? (
                    <p className="text-xs text-[#94A3B8] italic">Buscando parceiros cadastrados na assessoria...</p>
                  ) : filteredPartners.length === 0 ? (
                    <p className="text-xs text-red-500 font-semibold italic">Nenhum parceiro encontrado.</p>
                  ) : (
                    <select
                      value={selectedPartnerId}
                      onChange={(e) => handleSelectPartner(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
                    >
                      <option value="">-- Selecionar Parceiro --</option>
                      {filteredPartners.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name || "Sem Nome"} ({p.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Resultado da Comparação */}
            {comparisonLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-xs">Consolidando dados do duelo...</p>
              </div>
            ) : comparison ? (
              <div className="space-y-6">
                
                {/* Duelo de Consistência e Volume */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Card Consistência */}
                  <div className="glass-card rounded-2xl p-5 border border-[#E2E8F0]/80">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#2563EB]" /> Presença (Treinos Concluídos)
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Você */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">Você</span>
                          <span className="text-[#2563EB] font-mono">{comparison.myInfo.sessionsCount} treinos</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-[#2563EB] h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount) > 0
                                  ? (comparison.myInfo.sessionsCount / Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Parceiro */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">{comparison.partnerInfo.name}</span>
                          <span className="text-[#94A3B8] font-mono">{comparison.partnerInfo.sessionsCount} treinos</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-zinc-800 h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount) > 0
                                  ? (comparison.partnerInfo.sessionsCount / Math.max(comparison.myInfo.sessionsCount, comparison.partnerInfo.sessionsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Volume de Trabalho */}
                  <div className="glass-card rounded-2xl p-5 border border-[#E2E8F0]/80">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#2563EB]" /> Volume de Séries Concluídas
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Você */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">Você</span>
                          <span className="text-[#2563EB] font-mono">{comparison.myInfo.setsCount} séries</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-[#2563EB] h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount) > 0
                                  ? (comparison.myInfo.setsCount / Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Parceiro */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#0F172A]">{comparison.partnerInfo.name}</span>
                          <span className="text-[#94A3B8] font-mono">{comparison.partnerInfo.setsCount} séries</span>
                        </div>
                        <div className="w-full bg-white h-3 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                          <div
                            className="bg-zinc-800 h-full rounded-lg transition-all duration-1000"
                            style={{
                              width: `${
                                Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount) > 0
                                  ? (comparison.partnerInfo.setsCount / Math.max(comparison.myInfo.setsCount, comparison.partnerInfo.setsCount)) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Exercícios em Comum nos Planos */}
                <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
                      <Swords className="w-4 h-4 text-[#2563EB]" /> Exercícios em Comum
                    </h4>
                    <span className="text-[10px] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-bold text-[#2563EB]">
                      {comparison.sharedExercises.length} exercício{comparison.sharedExercises.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {comparison.sharedExercises.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-[#E2E8F0] rounded-xl">
                      <Dumbbell className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
                      <p className="text-xs text-[#94A3B8] font-medium">
                        Vocês não possuem exercícios em comum nos planos de treino atuais.
                      </p>
                      <p className="text-[10px] text-[#94A3B8] mt-1">
                        Peça ao seu treinador para incluir exercícios semelhantes!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {/* Agrupados por grupo muscular */}
                      {(() => {
                        const groups = comparison.sharedExercises.reduce((acc, ex) => {
                          const group = ex.muscleGroup || "Outros";
                          if (!acc[group]) acc[group] = [];
                          acc[group].push(ex);
                          return acc;
                        }, {} as Record<string, typeof comparison.sharedExercises>);
                        
                        return Object.entries(groups).map(([group, exercises]) => (
                          <div key={group}>
                            <p className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1.5 mt-3 first:mt-0">
                              {group}
                            </p>
                            <div className="space-y-1.5">
                              {exercises.map((ex) => (
                                <div key={ex.exerciseId} className="p-2.5 bg-zinc-50 rounded-lg border border-[#E2E8F0]/60 flex items-center justify-between gap-3 hover:border-blue-200 transition-all">
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#0F172A] truncate">{ex.name}</p>
                                    <p className="text-[9px] text-[#94A3B8]">{ex.equipment}</p>
                                  </div>
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0 border border-emerald-200/50">
                                    Em Comum ✓
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>

                {/* Duelo de Carga nos Exercícios em Comum */}
                {comparison.exerciseComparison.length > 0 && (
                  <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0]/80">
                    <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#2563EB]" /> Duelo de PRs — Exercícios em Comum
                    </h4>

                    {comparison.exerciseComparison.filter(ex => ex.myMax > 0 || ex.partnerMax > 0).length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-[#E2E8F0] rounded-xl">
                        <TrendingUp className="w-6 h-6 mx-auto text-[#94A3B8] mb-2" />
                        <p className="text-xs text-[#94A3B8] font-medium">
                          Nenhum de vocês registrou carga nos exercícios em comum ainda.
                        </p>
                        <p className="text-[10px] text-[#94A3B8] mt-1">
                          Complete treinos para gerar o duelo de cargas! 💪
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comparison.exerciseComparison
                          .filter(ex => ex.myMax > 0 || ex.partnerMax > 0)
                          .map((ex) => {
                            const maxBetween = Math.max(ex.myMax, ex.partnerMax);
                            const iAmWinning = ex.myMax > ex.partnerMax;
                            const isTied = ex.myMax === ex.partnerMax && ex.myMax > 0;
                            return (
                              <div key={ex.exerciseId} className="p-4 rounded-xl bg-zinc-50 border border-[#E2E8F0]/60">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h5 className="text-xs font-bold text-[#0F172A]">{ex.exerciseName}</h5>
                                    <p className="text-[9px] text-[#94A3B8]">{ex.muscleGroup}</p>
                                  </div>
                                  {!isTied && (ex.myMax > 0 || ex.partnerMax > 0) && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      iAmWinning
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                        : "bg-red-50 text-red-600 border border-red-200/50"
                                    }`}>
                                      {iAmWinning ? "Você vence 🏆" : `${comparison.partnerInfo.name.split(" ")[0]} vence`}
                                    </span>
                                  )}
                                  {isTied && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/50">
                                      Empate ⚔️
                                    </span>
                                  )}
                                </div>
                                
                                {/* Barras de comparação */}
                                <div className="space-y-2.5">
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                      <span className="text-[#0F172A]">Você</span>
                                      <span className="text-[#2563EB] font-mono">{ex.myMax > 0 ? `${ex.myMax}kg` : "—"}</span>
                                    </div>
                                    <div className="w-full bg-white h-2.5 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                                      <div
                                        className="bg-[#2563EB] h-full rounded-lg transition-all duration-1000"
                                        style={{ width: `${maxBetween > 0 ? (ex.myMax / maxBetween) * 100 : 0}%` }}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-bold">
                                      <span className="text-[#0F172A]">{comparison.partnerInfo.name.split(" ")[0]}</span>
                                      <span className="text-[#94A3B8] font-mono">{ex.partnerMax > 0 ? `${ex.partnerMax}kg` : "—"}</span>
                                    </div>
                                    <div className="w-full bg-white h-2.5 rounded-lg overflow-hidden border border-[#E2E8F0]/40">
                                      <div
                                        className="bg-zinc-700 h-full rounded-lg transition-all duration-1000"
                                        style={{ width: `${maxBetween > 0 ? (ex.partnerMax / maxBetween) * 100 : 0}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="p-12 text-center text-[#94A3B8] border border-[#E2E8F0] border-dashed rounded-2xl">
                <Users className="w-8 h-8 mx-auto text-[#475569] mb-2" />
                <p className="text-xs">Selecione um parceiro de treino acima para ver o duelo de performance.</p>
              </div>
            )}
          </div>
        )}

        {/* Aba 3: Meu Peso */}
        {activeTab === "peso" && (
          <div className="space-y-6 animate-fade-in">
            {/* Card Objetivo de Peso */}
            <div className="glass-card rounded-2xl p-5 border border-[#E2E8F0] bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Foco do seu Objetivo</h4>
                <p className="text-[10px] text-[#94A3B8] mt-1">
                  Define se o ganho (Hipertrofia) ou a perda (Emagrecimento) de peso será destacado em verde.
                </p>
              </div>
              <div className="flex bg-zinc-100 p-1 rounded-xl border border-[#E2E8F0] w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleUpdateWeightGoal("EMAGRECER")}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    weightGoal === "EMAGRECER"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  Emagrecimento
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateWeightGoal("GANHAR_MASSA")}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    weightGoal === "GANHAR_MASSA"
                      ? "bg-[#2563EB] text-white shadow-sm"
                      : "text-[#94A3B8] hover:text-[#0F172A]"
                  }`}
                >
                  Ganho de Massa
                </button>
              </div>
            </div>
            {/* Card Registrar Peso */}
            <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0] bg-white shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2563EB]" />
                Registrar Peso Corporal
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Monitore sua evolução registrando seu peso regularmente. Os registros também ficarão disponíveis para seu treinador.
              </p>
              
              <form onSubmit={handleSaveWeight} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ex: 75.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:border-[#2563EB] outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Data</label>
                  <input
                    type="date"
                    required
                    value={newWeightDate}
                    onChange={(e) => setNewWeightDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-sm text-[#0F172A] focus:border-[#2563EB] outline-none transition-all"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={savingWeight}
                  className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingWeight ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Registrar"
                  )}
                </button>
              </form>
              
              {weightError && (
                <p className="text-[11px] text-red-600 font-semibold">{weightError}</p>
              )}
            </div>

            {/* Card Histórico */}
            <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0] bg-white shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0F172A]">Histórico de Registros</h3>
              
              {measurementsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#94A3B8]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mb-2" />
                  <p className="text-xs">Buscando histórico...</p>
                </div>
              ) : measurements.length === 0 ? (
                <p className="text-xs text-[#94A3B8] text-center py-6">Você ainda não registrou nenhum peso.</p>
              ) : (
                <div className="divide-y divide-[#E2E8F0] max-h-96 overflow-y-auto pr-1">
                  {measurements.map((m, idx) => {
                    const nextMeasurement = measurements[idx + 1];
                    const diff = nextMeasurement ? m.weight - nextMeasurement.weight : 0;
                    
                    const isExpanded = expandedMeasurementId === m.id;
                    const hasAdditionalInfo = 
                      (m.bodyFat !== null && m.bodyFat !== undefined) ||
                      (m.chest !== null && m.chest !== undefined) ||
                      (m.waist !== null && m.waist !== undefined) ||
                      (m.armLeft !== null && m.armLeft !== undefined) ||
                      (m.armRight !== null && m.armRight !== undefined) ||
                      (m.thighLeft !== null && m.thighLeft !== undefined) ||
                      (m.thighRight !== null && m.thighRight !== undefined) ||
                      (m.calfLeft !== null && m.calfLeft !== undefined) ||
                      (m.calfRight !== null && m.calfRight !== undefined) ||
                      (m.photos && m.photos.length > 0);

                    return (
                      <div key={m.id} className="py-3 first:pt-0 last:pb-0">
                        <div 
                          onClick={() => {
                            if (hasAdditionalInfo) {
                              setExpandedMeasurementId(isExpanded ? null : m.id);
                            }
                          }}
                          className={`flex items-center justify-between transition-colors ${hasAdditionalInfo ? "cursor-pointer hover:bg-zinc-55/60 p-1.5 rounded-xl -mx-1.5" : ""}`}
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-[#0F172A] flex items-center gap-1.5">
                              {new Date(m.date).toLocaleDateString("pt-BR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                timeZone: "UTC",
                              })}
                              {hasAdditionalInfo && (
                                <span className="text-[9px] bg-blue-50 text-[#2563EB] px-1 py-0.2 rounded font-bold uppercase tracking-wider scale-90">
                                  Completo
                                </span>
                              )}
                            </span>
                            {nextMeasurement && (
                              <span className={`text-[10px] font-bold block ${
                                diff > 0 
                                  ? weightGoal === "GANHAR_MASSA" ? "text-emerald-500" : "text-red-500"
                                  : diff < 0 
                                  ? weightGoal === "GANHAR_MASSA" ? "text-red-500" : "text-emerald-500"
                                  : "text-[#94A3B8]"
                              }`}>
                                {diff > 0 ? `+${diff.toFixed(1)} kg 📈` : diff < 0 ? `${diff.toFixed(1)} kg 📉` : "Sem alteração"}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-base font-black text-[#2563EB] font-mono">
                              {m.weight.toFixed(1)} kg
                            </div>
                            {hasAdditionalInfo && (
                              <ChevronRight className={`w-4 h-4 text-[#94A3B8] transition-transform ${isExpanded ? "rotate-90 text-[#2563EB]" : ""}`} />
                            )}
                          </div>
                        </div>

                        {/* Detalhes Adicionais se Expandido */}
                        {isExpanded && hasAdditionalInfo && (
                          <div className="mt-3 p-4 rounded-xl bg-zinc-55/40 border border-[#E2E8F0] space-y-4 animate-slide-down">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-[#94A3B8]">
                              {m.bodyFat !== null && m.bodyFat !== undefined && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">BF (Gordura)</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">{m.bodyFat}%</span>
                                </div>
                              )}
                              {m.chest !== null && m.chest !== undefined && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Peitoral</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">{m.chest} cm</span>
                                </div>
                              )}
                              {m.waist !== null && m.waist !== undefined && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Cintura</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">{m.waist} cm</span>
                                </div>
                              )}
                              {(m.armLeft !== null || m.armRight !== null) && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Braços (E/D)</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">
                                    {m.armLeft ?? "--"} / {m.armRight ?? "--"} cm
                                  </span>
                                </div>
                              )}
                              {(m.thighLeft !== null || m.thighRight !== null) && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Coxas (E/D)</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">
                                    {m.thighLeft ?? "--"} / {m.thighRight ?? "--"} cm
                                  </span>
                                </div>
                              )}
                              {(m.calfLeft !== null || m.calfRight !== null) && (
                                <div>
                                  <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8]">Panturrilhas (E/D)</span>
                                  <span className="text-[#0F172A] font-bold font-mono text-xs">
                                    {m.calfLeft ?? "--"} / {m.calfRight ?? "--"} cm
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Fotos comparativas se existirem */}
                            {m.photos && m.photos.length > 0 && (
                              <div className="pt-3 border-t border-[#E2E8F0]/80">
                                <span className="block font-bold text-[9px] uppercase tracking-wider text-[#94A3B8] mb-2 font-display">Fotos Comparativas</span>
                                <div className="flex gap-2 flex-wrap">
                                  {m.photos.map((photo, pIdx) => (
                                    <div
                                      key={pIdx}
                                      onClick={() => setSelectedPhotoForZoom(photo)}
                                      className="w-14 h-14 rounded-lg bg-zinc-50 border border-[#E2E8F0] overflow-hidden relative cursor-zoom-in hover:border-[#2563EB] transition-all"
                                    >
                                      <img src={photo} alt={`Foto ${pIdx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Aba de Conquistas */}
        {activeTab === "conquistas" && (
          <div className="space-y-6 animate-fade-in">
            {/* Gamification Summary Card */}
            {!gamificationLoading && gamification && (
              <div className="glass-card rounded-2xl p-6 border border-[#E2E8F0] bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                  <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 font-extrabold text-2xl">
                      🏆
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-[#0F172A]">Sua Jornada de Conquistas</h3>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        Nível {gamification.level} • {gamification.levelTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
                    <div className="text-center bg-zinc-50 border border-[#E2E8F0]/80 rounded-xl px-4 py-3 min-w-[90px]">
                      <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Treinos</span>
                      <span className="text-lg font-extrabold text-[#0F172A] font-mono">{gamification.totalSessions}</span>
                    </div>
                    <div className="text-center bg-zinc-50 border border-[#E2E8F0]/80 rounded-xl px-4 py-3 min-w-[90px]">
                      <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Recordes (PR)</span>
                      <span className="text-lg font-extrabold text-[#0F172A] font-mono">{gamification.prsCount}</span>
                    </div>
                    <div className="text-center bg-zinc-50 border border-[#E2E8F0]/80 rounded-xl px-4 py-3 min-w-[90px]">
                      <span className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Peso Reg.</span>
                      <span className="text-lg font-extrabold text-[#0F172A] font-mono">{gamification.measurementsCount}</span>
                    </div>
                    <div className="text-center bg-zinc-50 border border-[#E2E8F0]/80 rounded-xl px-4 py-3 min-w-[90px]">
                      <span className="block text-xs font-bold text-emerald-600 uppercase tracking-wider">Semanas Seguidas 🔥</span>
                      <span className="text-lg font-extrabold text-emerald-600 font-mono">
                        {gamification.streak} {gamification.streak === 1 ? "semana" : "semanas"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar to next level */}
                <div className="mt-6 pt-5 border-t border-[#E2E8F0]/80 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-[#475569]">
                    <span>Progresso para o Nível {gamification.level + 1}</span>
                    <span className="font-mono text-[#2563EB]">{gamification.currentLevelXp} / {gamification.nextLevelXpNeeded} XP</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200/50">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#00C2FF] transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.2)]"
                      style={{ width: `${Math.min(100, (gamification.currentLevelXp / gamification.nextLevelXpNeeded) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {gamificationLoading && (
              <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-xs">Buscando sua jornada de conquistas...</p>
              </div>
            )}

            {/* Horizontal Timeline Roadmap */}
            {!gamificationLoading && gamification && (
              <>
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Mapa do Seu Progresso
                      </h3>
                      <p className="text-[10px] text-[#94A3B8] mt-0.5">Clique nos checkpoints para ver as conquistas de cada Tier</p>
                    </div>
                  </div>
                  
                  <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-2">
                    {/* Connecting Line behind nodes (Desktop only) */}
                    <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-[#E2E8F0] hidden sm:block z-0">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 transition-all duration-700"
                        style={{ width: `${((selectedTier - 1) / 3) * 100}%` }}
                      />
                    </div>

                    {/* Nodes */}
                    {[1, 2, 3, 4].map((tierNum) => {
                      const config = TIER_CONFIG[tierNum] || TIER_CONFIG[1];
                      const tierAchievements = gamification.achievements.filter(a => a.tier === tierNum);
                      const tierUnlocked = tierAchievements.filter(a => a.unlocked).length;
                      const tierTotal = tierAchievements.length;
                      const isCompleted = tierUnlocked === tierTotal;
                      const isSelected = selectedTier === tierNum;

                      return (
                        <button
                          key={tierNum}
                          type="button"
                          onClick={() => setSelectedTier(tierNum)}
                          className={`relative z-10 flex flex-row sm:flex-col items-center gap-3 sm:gap-2.5 p-3.5 sm:p-2.5 rounded-2xl w-full sm:w-auto transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? "bg-blue-50/50 sm:bg-transparent border border-blue-100 sm:border-none shadow-sm sm:shadow-none" 
                              : "hover:bg-zinc-50/50 sm:hover:bg-transparent border border-transparent"
                          }`}
                        >
                          {/* Node circle */}
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                            isCompleted
                              ? `bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20`
                              : isSelected
                              ? `bg-[#2563EB] border-[#2563EB] text-white shadow-lg shadow-blue-500/20`
                              : `bg-white border-zinc-200 text-zinc-400`
                          } ${isSelected ? "scale-110 rotate-3" : "scale-100 hover:scale-105"}`}>
                            {isCompleted ? "✓" : tierNum}
                          </div>

                          {/* Labels */}
                          <div className="text-left sm:text-center">
                            <p className={`text-xs font-bold transition-colors ${isSelected ? "text-[#2563EB]" : "text-[#0F172A]"}`}>
                              {config.label}
                            </p>
                            <p className="text-[9px] text-[#94A3B8] font-bold font-mono">
                              {tierUnlocked}/{tierTotal} Concluído
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter and Achievements List */}
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                    <div>
                      <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1">
                        Conquistas de {TIER_CONFIG[selectedTier]?.label}
                      </h4>
                      <p className="text-[10px] text-[#94A3B8]">{TIER_CONFIG[selectedTier]?.sublabel}</p>
                    </div>
                    
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-[#E2E8F0] shadow-xs">
                      {[
                        { id: "all", label: "Todas" },
                        { id: "unlocked", label: "Desbloqueadas" },
                        { id: "locked", label: "Em Progresso" }
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setAchievementFilter(f.id as any)}
                          className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                            achievementFilter === f.id
                              ? "bg-white text-[#2563EB] shadow-xs"
                              : "text-[#94A3B8] hover:text-[#0F172A]"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid */}
                  {gamification.achievements
                    .filter(a => a.tier === selectedTier)
                    .filter(a => {
                      if (achievementFilter === "unlocked") return a.unlocked;
                      if (achievementFilter === "locked") return !a.unlocked;
                      return true;
                    }).length === 0 ? (
                      <div className="p-10 text-center border border-dashed border-[#E2E8F0] bg-white rounded-2xl">
                        <Trophy className="w-8 h-8 mx-auto text-[#94A3B8] mb-2" />
                        <p className="text-xs text-[#94A3B8] font-medium">Nenhuma conquista nesta categoria.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gamification.achievements
                          .filter(a => a.tier === selectedTier)
                          .filter(a => {
                            if (achievementFilter === "unlocked") return a.unlocked;
                            if (achievementFilter === "locked") return !a.unlocked;
                            return true;
                          })
                          .map((achievement) => {
                            const percent = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
                            const hintText = getAchievementStatusHint(achievement, {
                              sessions: gamification.totalSessions,
                              prs: gamification.prsCount,
                              measurements: gamification.measurementsCount,
                              streak: gamification.streak
                            });

                            return (
                              <div 
                                key={achievement.id}
                                className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                                  achievement.unlocked
                                    ? "bg-white border-[#E2E8F0] shadow-sm hover:shadow-md hover:border-amber-200/70"
                                    : "bg-zinc-50/70 border-zinc-200/60 opacity-90"
                                }`}
                              >
                                {/* Glow effect for unlocked */}
                                {achievement.unlocked && (
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100/35 to-transparent rounded-bl-full pointer-events-none" />
                                )}

                                <div className="flex items-start gap-4">
                                  <div className={`p-3 rounded-xl flex-shrink-0 transition-transform ${
                                    achievement.unlocked
                                      ? "bg-amber-100/40 text-amber-500 border border-amber-200/50"
                                      : "bg-zinc-200/40 text-zinc-400 border border-zinc-200"
                                  }`}>
                                    {getAchievementIcon(achievement.icon, achievement.unlocked, "w-6 h-6")}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className={`text-xs font-bold truncate ${achievement.unlocked ? "text-[#0F172A]" : "text-zinc-500"}`}>
                                        {achievement.title}
                                      </h4>
                                      {achievement.unlocked && (
                                        <span className="text-[8px] bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider scale-95 origin-left">
                                          Desbloqueada
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-[#94A3B8] leading-normal mt-1">
                                      {achievement.description}
                                    </p>
                                  </div>
                                  <div className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                                    achievement.unlocked
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-zinc-200 text-zinc-400"
                                  }`}>
                                    +{achievement.xpReward} XP
                                  </div>
                                </div>

                                {/* Progress Bar & Hint */}
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-900/5 space-y-2">
                                  <div className="flex justify-between items-center text-[9px] text-[#94A3B8] font-bold">
                                    <span>PROGRESSO</span>
                                    <span className="font-mono">{achievement.progress} / {achievement.target}</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-200/70 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-700 ${
                                        achievement.unlocked
                                          ? "bg-emerald-500"
                                          : "bg-blue-500"
                                      }`}
                                      style={{ width: `${percent}%` }}
                                    />
                                  </div>
                                  <p className={`text-[10px] ${achievement.unlocked ? "text-emerald-600 font-medium" : "text-zinc-400 font-normal italic"} mt-1.5`}>
                                    {hintText}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                </div>
              </>
            )}
          </div>
        )}
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
                    {ex.videoUrl && (
                      <button
                        type="button"
                        onClick={() => setActiveVideoUrl(ex.videoUrl || null)}
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
              {getYouTubeEmbedUrl(activeVideoUrl) ? (
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


    </div>
  );
}
