"use client";
import BrandLogo from "@/components/BrandLogo";
import WorkoutTab from "./components/WorkoutTab";
import GroupsTab, { ComparisonResult } from "./components/GroupsTab";
import WeightTab from "./components/WeightTab";
import AchievementsTab from "./components/AchievementsTab";
import WeatherCard from "./components/WeatherCard";
import ImportWorkoutModal from "./components/ImportWorkoutModal";
import RankingLeaderboard, { RankingData, RankingItem } from "./components/RankingLeaderboard";
import RegisteredUsersModal from "./components/RegisteredUsersModal";

import { getAchievementStatusHint } from "@/lib/gamification";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/UserAvatar";
import EditProfilePhotoModal from "@/components/EditProfilePhotoModal";
import Link from "next/link";
import StudentWorkoutInstagramCard, {
  StudentGroupedFeed,
  WeeklyCheckinFeedItem,
} from "@/components/StudentWorkoutInstagramCard";
import {
  Dumbbell,
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
  ChevronLeft,
  ChevronRight,
  Layers,
  Eye,
  Tv,
  Flame,
  Trophy,
  Shield,
  Scale,
  Zap,
  Swords,
  Crown,
  Camera,
  Trash2,
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

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error";
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
  gifUrl?: string | null;
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

interface ComparisonData extends ComparisonResult {
  myInfo?: {
    id?: string;
    name: string;
    image?: string | null;
    sessionsCount: number;
    setsCount: number;
    streak?: number;
    last30Days?: number;
  };
  partnerInfo?: {
    id?: string;
    name: string;
    image?: string | null;
    sessionsCount: number;
    setsCount: number;
    streak?: number;
    last30Days?: number;
  };
  sharedExercises?: {
    exerciseId: string;
    name: string;
    muscleGroup: string;
    equipment: string;
  }[];
  exerciseComparison?: {
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
  const { data: session, update } = useSession();

  const [isProfilePhotoModalOpen, setIsProfilePhotoModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/user/profile", { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { image?: string | null };
          if (data.image) {
            setProfilePhoto(data.image);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar foto de perfil:", err);
      }
    };
    fetchUserProfile();
  }, []);
  
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados da Aba e Grupos/Duelo
  const [activeTab, setActiveTab] = useState<"fichas" | "conquistas" | "grupos" | "dupla" | "peso">("fichas");
  const [initialJoinCode, setInitialJoinCode] = useState<string | null>(null);
  const [selectedPlanForPreview, setSelectedPlanForPreview] = useState<WorkoutPlan | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState(false);
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [achievementFilter, setAchievementFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRegisteredUsersModalOpen, setIsRegisteredUsersModalOpen] = useState(false);

  // Capturar código de convite ou aba via URL (ex: link de convite recebido via WhatsApp)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const joinParam = params.get("join") || params.get("code");
      const tabParam = params.get("tab");

      if (joinParam) {
        setInitialJoinCode(joinParam);
        setActiveTab("grupos");
      } else if (
        tabParam === "grupos" ||
        tabParam === "dupla" ||
        tabParam === "peso" ||
        tabParam === "conquistas" ||
        tabParam === "fichas"
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Toast feedback system
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (text: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleOpenMedia = (url: string | null) => {
    setMediaLoading(true);
    setMediaError(false);
    setActiveVideoUrl(url);
  };

  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const clean = url.trim();
    if (clean.toLowerCase().startsWith("javascript:") || clean.toLowerCase().startsWith("data:")) {
      return null;
    }
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = clean.match(regExp);
    if (match && match[2] && match[2].length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(match[2])) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return null;
  };

  const getMediaUrl = (url: string | null) => {
    if (!url) return "";
    const clean = url.trim();
    if (clean.toLowerCase().startsWith("javascript:") || clean.toLowerCase().startsWith("data:")) {
      return "";
    }
    if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
      return clean;
    }
    if (clean.startsWith("videos/") || clean.startsWith("images/")) {
      return `/api/media/${clean}`;
    }
    return "";
  };


  const handleTabChange = (tab: "fichas" | "conquistas" | "grupos" | "dupla" | "peso") => {
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
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [gamificationLoading, setGamificationLoading] = useState(true);

  const [ranking, setRanking] = useState<RankingData | null>(null);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [selectedPhotosList, setSelectedPhotosList] = useState<WeeklyCheckinFeedItem[] | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  // Agrupamento de fotos por aluno no estilo Instagram (1 card por aluno com carrossel se houver múltiplas fotos)
  const groupedStudentFeeds: StudentGroupedFeed[] = React.useMemo(() => {
    if (!ranking?.weeklyFeed) return [];
    const map = new Map<string, StudentGroupedFeed>();

    for (const item of ranking.weeklyFeed) {
      const key = item.studentId || item.studentName;
      if (!map.has(key)) {
        map.set(key, {
          studentId: item.studentId,
          studentName: item.studentName,
          studentImage: item.studentImage,
          photos: [],
        });
      }
      map.get(key)!.photos.push(item);
    }

    return Array.from(map.values());
  }, [ranking?.weeklyFeed]);

  const [deletingPhoto, setDeletingPhoto] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleDeleteWorkoutPhoto = async (photoId: string) => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeletingPhoto(true);
    try {
      const res = await fetch(`/api/student/workout-sessions/${photoId}/photo`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (selectedPhotosList) {
          const updatedPhotos = selectedPhotosList.filter((p) => p.id !== photoId);
          if (updatedPhotos.length === 0) {
            setSelectedPhotosList(null);
          } else {
            setSelectedPhotosList(updatedPhotos);
            setSelectedPhotoIndex(0);
          }
        }

        setRanking((prev) => {
          if (!prev || !prev.weeklyFeed) return prev;
          return {
            ...prev,
            weeklyFeed: prev.weeklyFeed.filter((p) => p.id !== photoId),
          };
        });
      } else {
        showToast("Não foi possível remover a foto do treino.", "error");
      }
    } catch {
      showToast("Erro ao conectar com o servidor. Tente novamente.", "error");
    } finally {
      setDeletingPhoto(false);
      setDeleteConfirm(false);
    }
  };


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
        showToast("Divisão e dias atualizados com sucesso!");
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
        const response = await fetch("/api/student/workout-plans", { cache: 'no-store' });
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
        const response = await fetch("/api/student/prs", { cache: 'no-store' });
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
        const response = await fetch("/api/student/gamification", { cache: 'no-store' });
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
        const response = await fetch("/api/student/ranking", { cache: 'no-store' });
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
    if (savedTab && ["fichas", "conquistas", "grupos", "dupla", "peso"].includes(savedTab)) {
      setActiveTab((savedTab === "dupla" ? "grupos" : savedTab) as "fichas" | "conquistas" | "grupos" | "dupla" | "peso");
    }
  }, []);

  // Buscar lista de parceiros ao carregar a aba de grupos/dupla
  useEffect(() => {
    if ((activeTab === "grupos" || activeTab === "dupla") && partners.length === 0) {
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
        showToast("Peso registrado com sucesso! ⚖️");
      } else {
        const data = await response.json();
        setWeightError(data.error || "Erro ao salvar.");
      }
    } catch {
      setWeightError("Erro de conexão. Verifique sua internet e tente novamente.");
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
      {/* Header com suporte total a Safe Area (iPhone Notch, Dynamic Island e Android) */}
      <header 
        className="border-b border-[#E2E8F0]/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 pt-safe"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <BrandLogo size={36} />

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botão Especial de Administrador: Ver quem ingressou no app (exclusivo para cassianoomotta@gmail.com) */}
            {session?.user?.email === "cassianoomotta@gmail.com" && (
              <button
                type="button"
                onClick={() => setIsRegisteredUsersModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer border border-slate-700/60"
                title="Ver atletas cadastrados na plataforma (Permissão Especial)"
              >
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>Atletas Ingressados</span>
              </button>
            )}

            {/* User Avatar & Profile Click -> Redireciona para /student/profile */}
            <Link
              href="/student/profile"
              className="flex items-center gap-2 group p-1 pr-1.5 sm:pr-2.5 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-[#E2E8F0]"
              title="Meu Perfil e Configurações da Conta"
            >
              <div className="relative">
                <UserAvatar
                  name={session?.user?.name}
                  image={profilePhoto || session?.user?.image}
                  size="md"
                />
                <span className="absolute bottom-0 right-0 p-1 rounded-full bg-[#2563EB] text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-white">
                  <Camera className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors leading-tight">
                  {session?.user?.name || "Aluno"}
                </p>
                <p className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider">
                  Minha Conta
                </p>
              </div>
            </Link>

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
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl z-50 p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                    <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">Notificações</h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[#94A3B8] hover:text-[#0F172A] text-xs font-semibold"
                    >
                      Fechar
                    </button>
                  </div>

                  {/* Acesso Rápido Admin: Atletas Ingressados */}
                  {session?.user?.email === "cassianoomotta@gmail.com" && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        setIsRegisteredUsersModalOpen(true);
                      }}
                      className="w-full mb-1 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-all flex items-center justify-between border border-blue-200/60 cursor-pointer active:scale-95"
                    >
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Ver Quem Ingressou no App</span>
                      </div>
                      <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black">
                        Admin
                      </span>
                    </button>
                  )}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8">
        
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

        {/* Liga dos Titãs — Ranking Geral (posicionado estrategicamente entre o Nível do Usuário e o Check-in da Turma) */}
        <RankingLeaderboard
          ranking={ranking}
          loading={rankingLoading}
          onOpenCheckinPhoto={(photo) => {
            setSelectedPhotosList([{
              id: photo.id,
              date: new Date().toISOString(),
              dayOfWeek: photo.dayOfWeekFull ? photo.dayOfWeekFull.substring(0, 3).toUpperCase() : "TREINO",
              dayOfWeekFull: photo.dayOfWeekFull,
              formattedDate: photo.formattedDate,
              photoUrl: photo.photoUrl,
              durationMinutes: 0,
              studentId: "",
              studentName: photo.studentName,
              studentImage: photo.studentImage,
            }]);
            setSelectedPhotoIndex(0);
          }}
        />

        {/* Seção de Fotos do Dia e da Semana dos Concorrentes na Tela Inicial */}
        {!rankingLoading && ranking && (
          <section className="mb-8 bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#2563EB] rounded-xl border border-blue-100">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
                    Check-ins da Turma (Fotos da Semana)
                  </h3>
                  <p className="text-[11px] text-[#94A3B8]">
                    Fotos de treino dos concorrentes nos últimos 7 dias
                  </p>
                </div>
              </div>

              {groupedStudentFeeds && groupedStudentFeeds.length > 0 && (
                <span className="text-[10px] font-bold bg-[#2563EB]/10 text-[#2563EB] px-2.5 py-1 rounded-full">
                  {groupedStudentFeeds.length} {groupedStudentFeeds.length === 1 ? "atleta no mural" : "atletas no mural"}
                </span>
              )}
            </div>

            {groupedStudentFeeds && groupedStudentFeeds.length > 0 ? (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                {groupedStudentFeeds.map((group) => (
                  <StudentWorkoutInstagramCard
                    key={group.studentId || group.studentName}
                    studentGroup={group}
                    onOpenZoom={(_photo, allPhotos, initialIdx) => {
                      setSelectedPhotosList(allPhotos);
                      setSelectedPhotoIndex(initialIdx);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <p className="text-xs text-[#64748B] font-semibold">
                  Nenhum colega postou foto de treino hoje ainda.
                </p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">
                  Conclua seu treino com foto para liderar o mural da assessoria!
                </p>
              </div>
            )}
          </section>
        )}

        {/* Abas */}
        {/* Abas Principais */}
        <div className="hidden sm:flex border-b border-slate-200 mb-6">
          <button
            onClick={() => handleTabChange("fichas")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "fichas"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Dumbbell className={`w-4 h-4 transition-colors ${activeTab === "fichas" ? "text-[#2563EB]" : "text-slate-400"}`} />
            <span>Meus Treinos</span>
          </button>
          <button
            onClick={() => handleTabChange("grupos")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "grupos" || activeTab === "dupla"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users className={`w-4 h-4 transition-colors ${activeTab === "grupos" || activeTab === "dupla" ? "text-[#2563EB]" : "text-slate-400"}`} />
            <span>Grupos</span>
          </button>
          <button
            onClick={() => handleTabChange("peso")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "peso"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <TrendingUp className={`w-4 h-4 transition-colors ${activeTab === "peso" ? "text-[#2563EB]" : "text-slate-400"}`} />
            <span>Peso</span>
          </button>
          <button
            onClick={() => handleTabChange("conquistas")}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === "conquistas"
                ? "border-[#2563EB] text-[#2563EB]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Trophy className={`w-4 h-4 transition-colors ${activeTab === "conquistas" ? "text-[#2563EB]" : "text-slate-400"}`} />
            <span>Conquistas</span>
          </button>
        </div>

        {/* Aba 1: Meus Treinos */}
        {activeTab === "fichas" && (
          <WorkoutTab
            loading={loading}
            plans={plans}
            handleOpenEdit={handleOpenEdit}
            setSelectedPlanForPreview={setSelectedPlanForPreview}
            onOpenImportModal={() => setIsImportModalOpen(true)}
          />
        )}


        {/* Aba 2: Grupos de Treino, Feed Social & Duelo 1v1 */}
        {(activeTab === "grupos" || activeTab === "dupla") && (
          <GroupsTab
            partnerSearchQuery={partnerSearchQuery}
            setPartnerSearchQuery={setPartnerSearchQuery}
            partners={partners}
            filteredPartners={filteredPartners}
            selectedPartnerId={selectedPartnerId}
            handleSelectPartner={handleSelectPartner}
            comparisonLoading={comparisonLoading}
            comparison={comparison}
            onOpenZoomPhoto={(photoUrl: string) => setSelectedPhotoForZoom(photoUrl)}
            onNavigateToWorkouts={() => setActiveTab("fichas")}
            initialJoinCode={initialJoinCode || undefined}
          />
        )}

        {/* Aba 3: Meu Peso */}
        {activeTab === "peso" && (
          <WeightTab
            measurementsLoading={measurementsLoading}
            measurements={measurements}
            newWeight={newWeight}
            setNewWeight={setNewWeight}
            newWeightDate={newWeightDate}
            setNewWeightDate={setNewWeightDate}
            savingWeight={savingWeight}
            handleSaveWeight={handleSaveWeight}
            weightGoal={weightGoal}
            handleUpdateWeightGoal={handleUpdateWeightGoal}
            weightError={weightError}
            expandedMeasurementId={expandedMeasurementId}
            setExpandedMeasurementId={setExpandedMeasurementId}
            setSelectedPhotoForZoom={setSelectedPhotoForZoom}
          />
        )}


        {/* Aba de Conquistas */}
        {activeTab === "conquistas" && (
          <AchievementsTab
            gamificationLoading={gamificationLoading}
            gamification={gamification}
            prsLoading={prsLoading}
            prs={prs}
            selectedTier={selectedTier}
            setSelectedTier={setSelectedTier}
            achievementFilter={achievementFilter}
            setAchievementFilter={setAchievementFilter}
          />
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
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none text-xs text-[#0F172A] transition-all"
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
                        onClick={() => handleOpenMedia(ex.gifUrl || ex.videoUrl || null)}
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
            <div className="aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden">
              {activeVideoUrl?.endsWith('.gif') ? (
                <>
                  {mediaLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400 bg-black z-10">
                      <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                      <span className="text-xs text-zinc-400 font-medium">Carregando demonstração...</span>
                    </div>
                  )}
                  <img
                    src={getMediaUrl(activeVideoUrl)}
                    alt="Execução do exercício"
                    className={`w-full h-full object-contain bg-black transition-opacity duration-300 ${mediaLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setMediaLoading(false)}
                    onError={() => {
                      setMediaLoading(false);
                      setMediaError(true);
                    }}
                  />
                  {mediaError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 p-6 text-center bg-zinc-950 z-20">
                      <Tv className="w-10 h-10 text-zinc-600 mb-2" />
                      <p className="text-xs font-semibold text-zinc-300">Não foi possível carregar a demonstração visual.</p>
                      <a
                        href={`https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${activeVideoUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline mt-2 inline-flex items-center gap-1"
                      >
                        Tentar abrir externamente <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </>
              ) : getYouTubeEmbedUrl(activeVideoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideoUrl) || ""}
                  title="Video Player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  className="w-full h-full"
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                  <Tv className="w-12 h-12 text-zinc-600 mb-3" />
                  <p className="text-sm font-semibold">Não foi possível carregar o vídeo inline.</p>
                  {getMediaUrl(activeVideoUrl) ? (
                    <a
                      href={getMediaUrl(activeVideoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline mt-2 inline-flex items-center gap-1"
                    >
                      Abrir em nova aba externa <ArrowRight className="w-3 h-3" />
                    </a>
                  ) : null}
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
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-bold transition-all active:scale-95 ${
              activeTab === "fichas" ? "text-[#2563EB]" : "text-[#94A3B8]"
            }`}
          >
            <Dumbbell className={`w-5 h-5 transition-transform duration-300 ${activeTab === "fichas" ? "scale-110 text-[#2563EB]" : "text-[#94A3B8]"}`} />
            <span>Meus Treinos</span>
          </button>
          <button
            onClick={() => handleTabChange("grupos")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-bold transition-all active:scale-95 ${
              activeTab === "grupos" || activeTab === "dupla" ? "text-[#2563EB]" : "text-[#94A3B8]"
            }`}
          >
            <Users className={`w-5 h-5 transition-transform duration-300 ${activeTab === "grupos" || activeTab === "dupla" ? "scale-110 text-[#2563EB]" : "text-[#94A3B8]"}`} />
            <span>Grupos</span>
          </button>
          <button
            onClick={() => handleTabChange("peso")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-bold transition-all active:scale-95 ${
              activeTab === "peso" ? "text-[#2563EB]" : "text-[#94A3B8]"
            }`}
          >
            <TrendingUp className={`w-5 h-5 transition-transform duration-300 ${activeTab === "peso" ? "scale-110 text-[#2563EB]" : "text-[#94A3B8]"}`} />
            <span>Peso</span>
          </button>
          <button
            onClick={() => handleTabChange("conquistas")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 text-[10px] font-bold transition-all active:scale-95 ${
              activeTab === "conquistas" ? "text-[#2563EB]" : "text-[#94A3B8]"
            }`}
          >
            <Trophy className={`w-5 h-5 transition-transform duration-300 ${activeTab === "conquistas" ? "scale-110 text-[#2563EB]" : "text-[#94A3B8]"}`} />
            <span>Conquistas</span>
          </button>
        </div>
      </div>

      {/* Modal de Importação de Treinos com IA */}
      <ImportWorkoutModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onPlanImported={async () => {
          try {
            setLoading(true);
            const response = await fetch("/api/student/workout-plans", { cache: 'no-store' });
            if (response.ok) {
              const data = await response.json();
              setPlans(sortPlansByWeekDays(data.plans));
            }
          } catch (e) {
            console.error("Erro ao atualizar fichas após importação:", e);
          } finally {
            setLoading(false);
          }
        }}
      />

      {/* Modal de Edição de Foto de Perfil */}
      <EditProfilePhotoModal
        isOpen={isProfilePhotoModalOpen}
        onClose={() => setIsProfilePhotoModalOpen(false)}
        currentImage={profilePhoto || session?.user?.image}
        userName={session?.user?.name}
        onPhotoUpdated={(newPhoto) => {
          setProfilePhoto(newPhoto);
          if (update) {
            update();
          }
        }}
      />

      {/* Modal Zoom Foto do Concorrente no estilo Carrossel Instagram */}
      {selectedPhotosList && selectedPhotosList.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
          onClick={() => setSelectedPhotosList(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <UserAvatar
                  name={selectedPhotosList[selectedPhotoIndex]?.studentName || "Atleta"}
                  image={selectedPhotosList[selectedPhotoIndex]?.studentImage}
                  size="md"
                  className="border border-slate-200 shrink-0"
                />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#0F172A] truncate">
                      {selectedPhotosList[selectedPhotoIndex]?.studentName}
                    </h4>
                    {selectedPhotosList.length > 1 && (
                      <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
                        {selectedPhotoIndex + 1} de {selectedPhotosList.length}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#64748B]">
                    {selectedPhotosList[selectedPhotoIndex]?.dayOfWeekFull} • {selectedPhotosList[selectedPhotoIndex]?.formattedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {Boolean(
                  selectedPhotosList[selectedPhotoIndex] &&
                  (
                    session?.user?.role === "TRAINER" ||
                    session?.user?.role === "ADMIN" ||
                    (
                      session?.user?.name &&
                      (
                        selectedPhotosList[selectedPhotoIndex]?.studentName.toLowerCase().includes(session.user.name.toLowerCase().split(" ")[0]) ||
                        session.user.name.toLowerCase().includes(selectedPhotosList[selectedPhotoIndex]?.studentName.toLowerCase().split(" ")[0])
                      )
                    )
                  )
                ) && (
                  <button
                    type="button"
                    onClick={() => handleDeleteWorkoutPhoto(selectedPhotosList[selectedPhotoIndex].id)}
                    disabled={deletingPhoto}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      deleteConfirm
                        ? "bg-red-600 text-white shadow-md animate-pulse"
                        : "text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200/60"
                    }`}
                    title={deleteConfirm ? "Clique novamente para confirmar a exclusão" : "Remover foto deste treino"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingPhoto ? "Removendo..." : deleteConfirm ? "Confirmar exclusão?" : "Remover foto"}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPhotosList(null);
                    setDeleteConfirm(false);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Imagem com Navegação Lateral e Dots estilo Instagram */}
            <div className="p-3 bg-slate-950 flex items-center justify-center flex-1 overflow-hidden relative">
              <div className="relative w-full aspect-[3/4] max-h-[66vh] flex items-center justify-center">
                <img
                  key={selectedPhotosList[selectedPhotoIndex]?.id}
                  src={selectedPhotosList[selectedPhotoIndex]?.photoUrl}
                  alt={`Check-in de ${selectedPhotosList[selectedPhotoIndex]?.studentName}`}
                  className="w-full h-full object-contain rounded-xl select-none"
                />
              </div>

              {/* Botões de Navegação Lateral no Modal */}
              {selectedPhotosList.length > 1 && (
                <>
                  {selectedPhotoIndex > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoIndex((prev) => prev - 1);
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm transition-all shadow-xl hover:scale-110 z-20 cursor-pointer"
                      title="Foto anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {selectedPhotoIndex < selectedPhotosList.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotoIndex((prev) => prev + 1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-sm transition-all shadow-xl hover:scale-110 z-20 cursor-pointer"
                      title="Próxima foto"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Dots de Paginação no Modal */}
                  <div className="absolute bottom-5 inset-x-0 flex justify-center items-center gap-1.5 z-20 pointer-events-none">
                    {selectedPhotosList.map((_, dotIdx) => (
                      <div
                        key={dotIdx}
                        className={`rounded-full transition-all duration-300 ${
                          dotIdx === selectedPhotoIndex
                            ? "w-2.5 h-2.5 bg-white shadow-lg scale-110"
                            : "w-1.5 h-1.5 bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-3 bg-slate-50 flex items-center justify-between text-[11px] text-[#64748B] font-medium border-t border-slate-100">
              <span>Check-in comprovado da assessoria</span>
              {selectedPhotosList.length > 1 && (
                <span className="font-semibold text-[#2563EB]">
                  {selectedPhotosList.length} treinos nos últimos 7 dias
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`animate-toast-in pointer-events-auto px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-emerald-50/95 border-emerald-200 text-emerald-700 shadow-emerald-500/10"
                  : "bg-red-50/95 border-red-200 text-red-700 shadow-red-500/10"
              }`}
            >
              <span>{toast.type === "success" ? "✅" : "⚠️"}</span>
              {toast.text}
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          BARRA DE NAVEGAÇÃO INFERIOR FIXA (MOBILE BOTTOM NAVIGATION DOCK)
          Ergonomia Fitts 48px + Safe Area iPhone/Android + Glassmorphism Premium
          ========================================================================= */}
      <nav
        aria-label="Navegação Principal do Aplicativo"
        className={`sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-2xl transition-all duration-300 bottom-nav-safe ${
          isImportModalOpen ? "hidden" : ""
        }`}
      >
        <div className="max-w-md mx-auto px-2 py-1 flex items-center justify-around gap-1">
          {/* Aba 1: Treinos */}
          <button
            onClick={() => handleTabChange("fichas")}
            className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === "fichas"
                ? "text-[#2563EB] font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-colors ${activeTab === "fichas" ? "bg-blue-50 text-[#2563EB]" : ""}`}>
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight leading-none">Treinos</span>
          </button>

          {/* Aba 2: Grupos & Mural */}
          <button
            onClick={() => handleTabChange("grupos")}
            className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === "grupos" || activeTab === "dupla"
                ? "text-[#2563EB] font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-colors ${activeTab === "grupos" || activeTab === "dupla" ? "bg-blue-50 text-[#2563EB]" : ""}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight leading-none">Grupos</span>
          </button>

          {/* Aba 3: Peso */}
          <button
            onClick={() => handleTabChange("peso")}
            className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === "peso"
                ? "text-[#2563EB] font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-colors ${activeTab === "peso" ? "bg-blue-50 text-[#2563EB]" : ""}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight leading-none">Peso</span>
          </button>

          {/* Aba 4: Conquistas */}
          <button
            onClick={() => handleTabChange("conquistas")}
            className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === "conquistas"
                ? "text-[#2563EB] font-bold"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <div className={`relative p-1 rounded-xl transition-colors ${activeTab === "conquistas" ? "bg-blue-50 text-[#2563EB]" : ""}`}>
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight leading-none">Conquistas</span>
          </button>
        </div>
      </nav>

      {/* Modal Exclusivo de Atletas Ingressados para cassianoomotta@gmail.com */}
      <RegisteredUsersModal
        isOpen={isRegisteredUsersModalOpen}
        onClose={() => setIsRegisteredUsersModalOpen(false)}
      />

    </div>
  );
}
