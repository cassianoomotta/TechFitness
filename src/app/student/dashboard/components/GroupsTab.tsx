"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Plus,
  Flame,
  Trophy,
  Copy,
  Check,
  LogOut,
  Trash2,
  Camera,
  Calendar,
  Clock,
  Star,
  Dumbbell,
  Sparkles,
  ChevronRight,
  UserPlus,
  Loader2,
  Crown,
  Swords,
  Layers,
  ArrowRight,
  Shield,
  Zap,
  Info,
  Maximize2,
  X,
  Share2,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

// Tipagens estritas para Grupos e Timeline
export interface GroupSummary {
  id: string;
  name: string;
  description?: string;
  icon: string;
  code: string;
  membersCount?: number;
  totalMembers?: number;
  isCreator?: boolean;
  createdAt?: string;
  membersPreview?: Array<{
    studentId: string;
    name: string;
    image?: string | null;
    sessionsCount: number;
    isCreator: boolean;
  }>;
}

export interface TimelineExerciseItem {
  name: string;
  sets: number;
  maxWeight: number;
}

export interface TimelinePost {
  id: string;
  date: string;
  durationMs?: number | null;
  satisfaction?: number | null;
  photoUrl?: string | null;
  isMe: boolean;
  student: {
    id: string;
    name: string;
    image?: string | null;
    streak: number;
    level: number;
    levelTitle: string;
    tierName: string;
    tierBadge: string;
  };
  groups: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  exercises: TimelineExerciseItem[];
  exercisesCount: number;
}

export interface GroupMemberDetail {
  id: string;
  role: string;
  joinedAt: string;
  student: {
    id: string;
    name: string;
    image?: string | null;
    streak: number;
    workoutsCount: number;
    totalXp: number;
    level: number;
    levelTitle: string;
  };
}

export interface GroupFullDetail {
  id: string;
  name: string;
  description: string;
  icon: string;
  code: string;
  creatorId: string;
  creatorName: string;
  creatorImage?: string | null;
  createdAt?: string;
  isCreator: boolean;
  membersCount: number;
  members: GroupMemberDetail[];
}

export interface LeaderboardMemberItem {
  memberId?: string;
  id?: string;
  studentId?: string;
  role?: string;
  joinedAt?: string;
  name?: string;
  image?: string | null;
  streak?: number;
  totalSessions?: number;
  workoutsCount?: number;
  totalXp?: number;
  level?: number;
  levelTitle?: string;
  student?: {
    id?: string;
    name?: string;
    image?: string | null;
    streak?: number;
    workoutsCount?: number;
    totalXp?: number;
    level?: number;
    levelTitle?: string;
  };
}

export interface PartnerItem {
  id: string;
  name: string;
  email: string;
}

export interface ComparisonAthlete {
  name: string;
  image?: string | null;
  workoutsLast30Days: number;
  streak: number;
}

export interface ComparisonExerciseItem {
  name: string;
  myMaxWeight: number;
  partnerMaxWeight: number;
}

export interface ComparisonResult {
  me: ComparisonAthlete;
  partner: ComparisonAthlete;
  exercises?: ComparisonExerciseItem[];
}

interface GroupsTabProps {
  // Props herdados de comparação para manter o Duelo 1-a-1
  partnerSearchQuery: string;
  setPartnerSearchQuery: (query: string) => void;
  partners: PartnerItem[];
  filteredPartners: PartnerItem[];
  selectedPartnerId: string;
  handleSelectPartner: (id: string) => void;
  comparisonLoading: boolean;
  comparison: ComparisonResult | null;
  onOpenZoomPhoto?: (photoUrl: string) => void;
  onNavigateToWorkouts?: () => void;
}

// =========================================================================
// Cache em memória para alta performance (Navegação instantânea 0ms)
// =========================================================================
let cachedGroups: GroupSummary[] | null = null;
let cachedTimeline: TimelinePost[] | null = null;
const cachedGroupDetails: Record<string, GroupFullDetail> = {};

export default function GroupsTab({
  partnerSearchQuery,
  setPartnerSearchQuery,
  partners,
  filteredPartners,
  selectedPartnerId,
  handleSelectPartner,
  comparisonLoading,
  comparison,
  onOpenZoomPhoto,
  onNavigateToWorkouts,
}: GroupsTabProps) {
  // Aba interna do componente: Feed Social vs Gerenciar Grupos vs Duelo 1-a-1
  const [internalTab, setInternalTab] = useState<"feed" | "groups" | "duel">("feed");

  // Dados dos grupos e timeline com hidratação de cache imediata (0ms)
  const [groups, setGroups] = useState<GroupSummary[]>(() => cachedGroups || []);
  const [groupsLoading, setGroupsLoading] = useState<boolean>(() => !cachedGroups);
  const [timeline, setTimeline] = useState<TimelinePost[]>(() => cachedTimeline || []);
  const [timelineLoading, setTimelineLoading] = useState<boolean>(() => !cachedTimeline);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");

  // Auto-selecionar o grupo se o usuário fizer parte de apenas 1 grupo
  useEffect(() => {
    if (groups.length === 1 && selectedGroupId === "all") {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  // Grupo ativo atualmente selecionado (ou o único grupo do usuário)
  const activeGroup = useMemo(() => {
    if (selectedGroupId !== "all") {
      return groups.find((g) => g.id === selectedGroupId) || null;
    }
    if (groups.length === 1) {
      return groups[0];
    }
    return null;
  }, [groups, selectedGroupId]);

  // Modais de Criação e Entrada
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Estados do formulário de criação
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newGroupIcon, setNewGroupIcon] = useState("🏋️");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Estados do formulário de entrada
  const [joinCode, setJoinCode] = useState("");
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Detalhes do grupo ativo para ver membros
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<GroupFullDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Feedback de cópia do código
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedModalCode, setCopiedModalCode] = useState(false);

  // Reações locais simuladas
  const [postReactions, setPostReactions] = useState<Record<string, { fire: number; muscle: number; clap: number; reacted: string | null }>>({});

  // Ícones disponíveis para personalização do grupo
  const EMOJI_OPTIONS = ["🏋️", "⚡", "🔥", "🥊", "🚴", "🏃", "🏆", "🥇", "💥", "💪", "⚔️", "🎯"];

  // Timeline filtrada em memória instantaneamente (0ms de latência e sem recarregar tela)
  // Exibe exclusivamente check-ins com foto no Mural, eliminando cards duplicados de texto vazios
  const displayedTimeline = useMemo(() => {
    let list = timeline;
    if (selectedGroupId !== "all") {
      list = timeline.filter((post: TimelinePost) =>
        post.groups?.some((g) => g.id === selectedGroupId)
      );
    }
    return list.filter((post: TimelinePost) => !!post.photoUrl && post.photoUrl.trim() !== "");
  }, [timeline, selectedGroupId]);

  // Carregar grupos do usuário (revalidação suave em segundo plano)
  const fetchUserGroups = async (forceSpinner = false) => {
    if (forceSpinner || !cachedGroups) {
      setGroupsLoading(true);
    }
    try {
      const res = await fetch("/api/student/groups");
      if (res.ok) {
        const data = await res.json();
        const items: GroupSummary[] = data.groups || [];
        setGroups(items);
        cachedGroups = items;
      }
    } catch (err) {
      console.error("Erro ao carregar grupos:", err);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Carregar timeline centralizada (revalidação suave em segundo plano)
  const fetchTimeline = async (forceSpinner = false) => {
    if (forceSpinner || !cachedTimeline) {
      setTimelineLoading(true);
    }
    try {
      const res = await fetch("/api/student/groups/timeline");
      if (res.ok) {
        const data = await res.json();
        const items: TimelinePost[] = data.timeline || [];
        setTimeline(items);
        cachedTimeline = items;
      }
    } catch (err) {
      console.error("Erro ao buscar timeline dos grupos:", err);
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
    fetchTimeline();
  }, []);

  // Mudar filtro de grupo (instantâneo via memória)
  const handleGroupFilterChange = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  // Copiar apenas o código de convite
  const handleCopyInviteCode = (group: GroupSummary) => {
    navigator.clipboard.writeText(group.code.trim());
    setCopiedCodeId(group.id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Criar grupo
  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!newGroupName.trim()) {
      setCreateError("Informe o nome do grupo.");
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await fetch("/api/student/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDesc.trim(),
          icon: newGroupIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Erro ao criar grupo.");
      } else {
        setShowCreateModal(false);
        setNewGroupName("");
        setNewGroupDesc("");
        setNewGroupIcon("🏋️");
        cachedGroups = null;
        cachedTimeline = null;
        // Recarregar grupos e timeline em paralelo
        await Promise.all([fetchUserGroups(true), fetchTimeline(true)]);
        if (data.group?.id) setSelectedGroupId(data.group.id);
      }
    } catch (err) {
      setCreateError("Erro de conexão ao criar grupo.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Entrar em grupo via código
  const handleJoinGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");

    let codeToSubmit = joinCode.trim().toUpperCase();
    const match = codeToSubmit.match(/TF-[A-Z0-9]{3,8}/i);
    if (match) {
      codeToSubmit = match[0].toUpperCase();
    }

    if (!codeToSubmit) {
      setJoinError("Informe o código de convite.");
      return;
    }

    setJoinSubmitting(true);
    try {
      const res = await fetch("/api/student/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToSubmit }),
      });

      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Código inválido ou erro ao entrar no grupo.");
      } else {
        setShowJoinModal(false);
        setJoinCode("");
        cachedGroups = null;
        cachedTimeline = null;
        // Recarregar em paralelo
        await Promise.all([fetchUserGroups(true), fetchTimeline(true)]);
        if (data.group?.id) setSelectedGroupId(data.group.id);
      }
    } catch (err) {
      setJoinError("Erro de conexão ao entrar no grupo.");
    } finally {
      setJoinSubmitting(false);
    }
  };

  // Abrir detalhes de membros do grupo com cache instantâneo (0ms)
  const handleOpenGroupDetails = async (groupId: string) => {
    // 1. Se já está em cache, abre na hora sem qualquer espera
    if (cachedGroupDetails[groupId]) {
      setSelectedGroupDetail(cachedGroupDetails[groupId]);
      setShowMembersModal(true);
      setDetailLoading(false);
      return;
    }

    // 2. Se não está em cache, abre imediatamente com os dados prévios do card
    const foundGroup = groups.find((g) => g.id === groupId);
    if (foundGroup) {
      setSelectedGroupDetail({
        id: foundGroup.id,
        name: foundGroup.name,
        description: foundGroup.description || "",
        icon: foundGroup.icon || "🏋️",
        code: foundGroup.code,
        creatorId: "",
        creatorName: foundGroup.isCreator ? "Você" : "Atleta",
        isCreator: !!foundGroup.isCreator,
        membersCount: foundGroup.membersCount || foundGroup.totalMembers || 1,
        members: [],
      });
    }

    setShowMembersModal(true);
    setDetailLoading(true);

    try {
      const res = await fetch(`/api/student/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        const rawLeaderboard: LeaderboardMemberItem[] = data.allTimeLeaderboard || [];
        const fallbackMembers: GroupMemberDetail[] = rawLeaderboard.map((m: LeaderboardMemberItem) => ({
          id: m.memberId || m.id || "",
          role: m.role || "MEMBER",
          joinedAt: m.joinedAt || new Date().toISOString(),
          student: {
            id: m.studentId || m.student?.id || "",
            name: m.name || m.student?.name || "Atleta",
            image: m.image || m.student?.image || null,
            streak: m.streak ?? m.student?.streak ?? 0,
            workoutsCount: m.totalSessions ?? m.workoutsCount ?? m.student?.workoutsCount ?? 0,
            totalXp: m.totalXp ?? m.student?.totalXp ?? 0,
            level: m.level ?? m.student?.level ?? 1,
            levelTitle: m.levelTitle ?? m.student?.levelTitle ?? "Iniciante",
          },
        }));

        const membersList: GroupMemberDetail[] =
          Array.isArray(data.group?.members) && data.group.members.length > 0
            ? data.group.members
            : fallbackMembers;

        const fullDetail: GroupFullDetail = {
          ...data.group,
          membersCount: data.group?.membersCount ?? data.group?.totalMembers ?? membersList.length,
          members: membersList,
        };

        cachedGroupDetails[groupId] = fullDetail;
        setSelectedGroupDetail(fullDetail);
      }
    } catch (err) {
      console.error("Erro ao buscar detalhes do grupo:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Sair do grupo
  const handleLeaveGroup = async (groupId: string, isCreator: boolean) => {
    const confirmMessage = isCreator
      ? "Tem certeza que deseja excluir este grupo? Todos os membros serão desvinculados."
      : "Tem certeza que deseja sair deste grupo?";
    if (!confirm(confirmMessage)) return;

    try {
      const res = await fetch(`/api/student/groups/${groupId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setShowMembersModal(false);
        setSelectedGroupDetail(null);
        delete cachedGroupDetails[groupId];
        cachedGroups = null;
        cachedTimeline = null;
        await Promise.all([fetchUserGroups(true), fetchTimeline(true)]);
        setSelectedGroupId("all");
      }
    } catch (err) {
      console.error("Erro ao sair/excluir grupo:", err);
    }
  };

  // Reagir a um post
  const handleReact = (postId: string, type: "fire" | "muscle" | "clap") => {
    setPostReactions((prev) => {
      const current = prev[postId] || { fire: 3, muscle: 2, clap: 1, reacted: null };
      if (current.reacted === type) {
        // Desfazer reação
        return {
          ...prev,
          [postId]: {
            ...current,
            [type]: Math.max(0, current[type] - 1),
            reacted: null,
          },
        };
      }
      return {
        ...prev,
        [postId]: {
          ...current,
          [type]: current[type] + 1,
          reacted: type,
        },
      };
    });
  };

  // Formatação de data amigável
  const formatPostTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (d.toDateString() === now.toDateString()) {
      return `Hoje às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffHours < 24) {
      return `Ontem às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Barra de Navegação Superior da Comunidade */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 p-3 sm:p-4 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
        {/* Toggle de Sub-Abas com Scroll Suave no Mobile */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setInternalTab("feed")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              internalTab === "feed"
                ? "bg-white text-[#2563EB] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera className={`w-4 h-4 shrink-0 transition-colors ${internalTab === "feed" ? "text-[#2563EB]" : "text-slate-400"}`} />
            <span>Mural</span>
          </button>
          <button
            onClick={() => setInternalTab("groups")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              internalTab === "groups"
                ? "bg-white text-[#2563EB] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className={`w-4 h-4 shrink-0 transition-colors ${internalTab === "groups" ? "text-[#2563EB]" : "text-slate-400"}`} />
            <span>Grupos</span>
            {groups.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold leading-none ${
                  internalTab === "groups"
                    ? "bg-blue-50 text-[#2563EB]"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {groups.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setInternalTab("duel")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              internalTab === "duel"
                ? "bg-white text-[#2563EB] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Swords className={`w-4 h-4 shrink-0 transition-colors ${internalTab === "duel" ? "text-[#2563EB]" : "text-slate-400"}`} />
            <span className="whitespace-nowrap">Duelo</span>
          </button>
        </div>

        {/* Botões de Ação Rápida: Criar E Entrar */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200/80 whitespace-nowrap cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Entrar com Código</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Criar Grupo</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          ABA 1: FEED SOCIAL / TIMELINE CENTRALIZADA DE CHECK-INS
          ========================================================================= */}
      {internalTab === "feed" && (
        <div className="space-y-6">
          {/* Pílulas de Filtro por Grupo - Apenas exibido se houver mais de 1 grupo para evitar poluição visual */}
          {groups.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1">
              <button
                onClick={() => handleGroupFilterChange("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  selectedGroupId === "all"
                    ? "bg-[#2563EB] text-white shadow-xs font-bold"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                }`}
              >
                <Users className={`w-3.5 h-3.5 ${selectedGroupId === "all" ? "text-white" : "text-slate-400"}`} />
                <span>Todos os Grupos</span>
              </button>

              {groups.map((group) => {
                const isSelected = selectedGroupId === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleGroupFilterChange(group.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-[#2563EB] text-white shadow-xs font-bold"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60"
                    }`}
                  >
                    <Users className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-400"}`} />
                    <span>{group.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Hub da Turma: Banner com Código de Convite & Pódio de Consistência */}
          {activeGroup && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-800/80 relative overflow-hidden">
              {/* Brilho sutil de fundo */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

              {/* Linha Superior: Nome do Grupo, Metadados e Ações */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-2xl shrink-0">
                    {activeGroup.icon || "🏋️"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
                        {activeGroup.name}
                      </h2>
                      {activeGroup.isCreator && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                          Criador
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                      <span>
                        {activeGroup.membersCount ?? activeGroup.totalMembers ?? (activeGroup.membersPreview?.length || 1)}{" "}
                        {(activeGroup.membersCount ?? activeGroup.totalMembers ?? (activeGroup.membersPreview?.length || 1)) === 1
                          ? "atleta"
                          : "atletas"}
                      </span>
                      {activeGroup.description && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 truncate max-w-xs">{activeGroup.description}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Código de Convite com Cópia Rápida */}
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                    <div className="text-left">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                        Convite
                      </span>
                      <span className="font-mono text-xs font-bold text-white tracking-wide">
                        {activeGroup.code}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyInviteCode(activeGroup)}
                      className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer"
                      title="Copiar código do grupo"
                    >
                      {copiedCodeId === activeGroup.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </button>
                  </div>

                  {/* Ver Ranking Completo */}
                  <button
                    onClick={() => handleOpenGroupDetails(activeGroup.id)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ranking Completo</span>
                  </button>
                </div>
              </div>

              {/* Pódio de Consistência (Top 3 Membros) */}
              {activeGroup.membersPreview && activeGroup.membersPreview.length > 0 && (
                <div className="relative z-10 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      Pódio de Consistência da Turma
                    </span>
                    <button
                      onClick={() => handleOpenGroupDetails(activeGroup.id)}
                      className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver todos ({activeGroup.membersCount ?? activeGroup.totalMembers ?? activeGroup.membersPreview.length})</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {activeGroup.membersPreview.slice(0, 3).map((member, idx) => {
                      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
                      const badgeBg =
                        idx === 0
                          ? "bg-amber-400/10 border-amber-400/30 text-amber-300"
                          : idx === 1
                          ? "bg-slate-300/10 border-slate-300/30 text-slate-200"
                          : "bg-amber-600/10 border-amber-600/30 text-amber-200";

                      return (
                        <div
                          key={member.studentId}
                          className={`flex items-center gap-3 p-2.5 rounded-2xl border backdrop-blur-sm transition-all ${badgeBg}`}
                        >
                          <div className="relative shrink-0">
                            <UserAvatar
                              name={member.name}
                              image={member.image}
                              size="sm"
                              className="ring-1 ring-white/20"
                            />
                            <span className="absolute -bottom-1 -right-1 text-xs">
                              {medal}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-slate-300 font-medium">
                              {member.sessionsCount} {member.sessionsCount === 1 ? "treino" : "treinos"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Título de Seção do Mural */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-400" />
                <span>Mural de Fotos de Treino</span>
              </h3>
              <p className="text-xs text-[#64748B]">
                {activeGroup
                  ? `Registros visuais de check-in da turma ${activeGroup.name}`
                  : "Registros visuais de check-in das suas turmas"}
              </p>
            </div>
          </div>

          {/* Estado de Carregamento da Timeline */}
          {timelineLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
              <p className="text-xs font-medium">Sincronizando mural da comunidade...</p>
            </div>
          ) : displayedTimeline.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3.5 border border-blue-100">
                <Camera className="w-7 h-7 text-[#2563EB]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#0F172A] mb-1.5">
                Nenhum check-in com foto postado ainda
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-6">
                Seja o primeiro da sua turma a postar foto: ao finalizar seu treino, tire uma foto de check-in para marcar presença no mural e inspirar seus amigos!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {onNavigateToWorkouts && (
                  <button
                    onClick={onNavigateToWorkouts}
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                  >
                    <Dumbbell className="w-4 h-4" />
                    <span>Ir para Meus Treinos</span>
                  </button>
                )}
                {groups.length === 0 && (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition-all border border-slate-200/80 flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-slate-400" />
                    <span>Entrar com Código</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Lista de Posts da Timeline (Design Limpo / Frontend Disruptivo) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayedTimeline.map((post) => {
                const reactions = postReactions[post.id] || { fire: 4, muscle: 2, clap: 1, reacted: null };
                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Topo do Post: Metadados e Atleta */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                      {/* Linha 1: Grupo e Horário */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          {post.groups.length > 0 ? (
                            post.groups.map((g) => (
                              <span
                                key={g.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                              >
                                <Users className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[140px]">{g.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                              <Dumbbell className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>Treino Individual</span>
                            </span>
                          )}

                          {post.isMe && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] text-[10px] font-semibold">
                              Você
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium shrink-0">
                          {formatPostTime(post.date)}
                        </span>
                      </div>

                      {/* Linha 2: Atleta, Nível e Streak */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar
                            name={post.student.name}
                            image={post.student.image}
                            size="md"
                            className="ring-1 ring-slate-200/80 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#0F172A] leading-tight truncate">
                              {post.student.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                              Nv. {post.student.level} • {post.student.levelTitle}
                            </p>
                          </div>
                        </div>

                        {post.student.streak > 0 && (
                          <div
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50/80 border border-amber-200/60 text-amber-700 text-xs font-semibold shrink-0"
                            title={`${post.student.streak} dias consecutivos de treino`}
                          >
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{post.student.streak}d</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Foto do Check-in */}
                    {post.photoUrl ? (
                      <div
                        onClick={() => onOpenZoomPhoto && onOpenZoomPhoto(post.photoUrl!)}
                        className="relative w-full aspect-[4/3] bg-slate-950 overflow-hidden cursor-pointer group"
                      >
                        <img
                          src={post.photoUrl}
                          alt={`Check-in de ${post.student.name}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Overlay: Tempo de Duração e Nota */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            {post.durationMs ? (
                              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[11px]">
                                <Clock className="w-3 h-3 text-slate-300" />
                                <span>{Math.round(post.durationMs / 60000)} min</span>
                              </div>
                            ) : null}

                            {post.satisfaction ? (
                              <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-[11px] text-amber-400">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>RPE {post.satisfaction}/10</span>
                              </div>
                            ) : null}
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white">
                            <Maximize2 className="w-3 h-3" />
                            <span>Ampliar</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Sem foto: Card discreto e elegante */
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200/70 flex items-center justify-center text-slate-500 shrink-0">
                          <Dumbbell className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">Treino Concluído</p>
                          <p className="text-[11px] text-slate-500">
                            {post.durationMs
                              ? `${Math.round(post.durationMs / 60000)} minutos registrados.`
                              : "Mais um dia de consistência garantido."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Resumo dos Exercícios - Linha Compacta */}
                    {post.exercises && post.exercises.length > 0 && (
                      <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
                        <Dumbbell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className="flex items-center gap-1.5 flex-nowrap">
                          {post.exercises.slice(0, 3).map((ex, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-white border border-slate-200/60 text-[11px] text-slate-600 font-medium whitespace-nowrap shadow-2xs"
                            >
                              {ex.name} {ex.maxWeight > 0 ? `• ${ex.maxWeight}kg` : ""}
                            </span>
                          ))}
                          {post.exercises.length > 3 && (
                            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                              +{post.exercises.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rodapé do Post: Reações Interativas Elegantes */}
                    <div className="p-3 sm:px-4 sm:py-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleReact(post.id, "fire")}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            reactions.reacted === "fire"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 hover:bg-slate-200/70 text-slate-600 border border-transparent"
                          }`}
                        >
                          <span>🔥</span>
                          <span>{reactions.fire}</span>
                        </button>

                        <button
                          onClick={() => handleReact(post.id, "muscle")}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            reactions.reacted === "muscle"
                              ? "bg-blue-50 text-[#2563EB] border border-blue-200"
                              : "bg-slate-100 hover:bg-slate-200/70 text-slate-600 border border-transparent"
                          }`}
                        >
                          <span>💪</span>
                          <span>{reactions.muscle}</span>
                        </button>

                        <button
                          onClick={() => handleReact(post.id, "clap")}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            reactions.reacted === "clap"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 hover:bg-slate-200/70 text-slate-600 border border-transparent"
                          }`}
                        >
                          <span>👏</span>
                          <span>{reactions.clap}</span>
                        </button>
                      </div>

                      {post.satisfaction ? (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>RPE {post.satisfaction}/10</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Check-in</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ABA 2: MEUS GRUPOS E GERENCIAMENTO COMPLETO
          ========================================================================= */}
      {internalTab === "groups" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Seus Grupos de Treino</h3>
            <p className="text-xs text-[#64748B]">
              Participe de turmas ilimitadas, convide amigos e acompanhe o ranking interno.
            </p>
          </div>

          {groupsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
              <p className="text-xs">Carregando seus grupos...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200/60">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">Você não está em nenhum grupo</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                Crie um grupo para sua turma da academia, amigos do trabalho ou clube de corrida. Não há limite de participantes!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeiro Grupo
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition-all border border-slate-200/80 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-slate-400" />
                  Tenho um Código de Convite
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((group) => {
                const isCopied = copiedCodeId === group.id;
                return (
                  <div
                    key={group.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Topo do Card do Grupo */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-lg shrink-0 mt-0.5 text-slate-600">
                            {group.icon ? <span>{group.icon}</span> : <Users className="w-5 h-5 text-slate-400" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-[#0F172A] leading-snug break-words">
                              {group.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                {group.membersCount ?? group.totalMembers ?? 1} {(group.membersCount ?? group.totalMembers ?? 1) === 1 ? "membro" : "membros"}
                              </span>
                            </div>
                          </div>
                        </div>
                        {group.isCreator && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] font-bold flex items-center gap-1 shrink-0">
                            <Crown className="w-3 h-3 text-amber-600" />
                            Criador
                          </span>
                        )}
                      </div>

                      {group.description && (
                        <p className="text-xs text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
                          {group.description}
                        </p>
                      )}

                      {/* Prévia dos Membros */}
                      {group.membersPreview && group.membersPreview.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-4 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex -space-x-2 overflow-hidden">
                            {group.membersPreview.map((m) => (
                              <UserAvatar
                                key={m.studentId}
                                name={m.name}
                                image={m.image}
                                size="xs"
                                className="ring-2 ring-white"
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-[#64748B] ml-1.5 font-medium">
                            {group.membersPreview.map((m) => m.name.split(" ")[0]).join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Código de Convite com 1-Clique para Copiar */}
                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 mb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Código de Convite
                          </span>
                          <span className="text-xs font-mono font-bold text-[#0F172A]">
                            {group.code}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyInviteCode(group)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isCopied
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
                          }`}
                          title="Copiar código de convite"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Botão de Ver Membros / Gerenciar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenGroupDetails(group.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#2563EB] hover:text-white text-[#0F172A] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer group/btn"
                      >
                        <Users className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white transition-colors" />
                        Membros e Ranking
                      </button>
                      <button
                        onClick={() => handleLeaveGroup(group.id, !!group.isCreator)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                        title={group.isCreator ? "Excluir Grupo" : "Sair do Grupo"}
                      >
                        {group.isCreator ? <Trash2 className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ABA 3: DUELO 1-A-1 (COMPARAÇÃO CLÁSSICA PRESERVADA)
          ========================================================================= */}
      {internalTab === "duel" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-2">
              <Swords className="w-5 h-5 text-[#2563EB]" /> Duelo
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
              Selecione qualquer colega da sua assessoria para comparar consistência, carga máxima e volume em tempo real!
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Buscar Parceiro (Nome ou E-mail)
                </label>
                <input
                  type="text"
                  placeholder="Digite o nome ou e-mail..."
                  value={partnerSearchQuery}
                  onChange={(e) => setPartnerSearchQuery(e.target.value)}
                  className="w-full p-3 min-h-[48px] rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-base md:text-sm text-[#0F172A] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                  Escolha seu Oponente
                </label>
                {partners.length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic">Buscando parceiros cadastrados na assessoria...</p>
                ) : filteredPartners.length === 0 ? (
                  <p className="text-xs text-red-500 font-semibold italic">Nenhum atleta encontrado.</p>
                ) : (
                  <select
                    value={selectedPartnerId}
                    onChange={(e) => handleSelectPartner(e.target.value)}
                    className="w-full p-3 min-h-[48px] rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-base md:text-sm text-[#0F172A] transition-all"
                  >
                    <option value="">-- Selecionar Atleta --</option>
                    {filteredPartners.map((p: PartnerItem) => (
                      <option key={p.id} value={p.id}>
                        {p.name || "Sem Nome"} ({p.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Resultado do Duelo */}
          {comparisonLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
              <p className="text-xs">Consolidando dados do duelo...</p>
            </div>
          ) : comparison ? (
            <div className="space-y-6">
              {/* Duelo de Consistência e Volume */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Atleta 1 (Você) */}
                <div className="bg-white rounded-3xl p-5 border border-blue-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center gap-3 mb-4">
                    <UserAvatar
                      name={comparison.me.name}
                      image={comparison.me.image}
                      size="md"
                      className="ring-2 ring-blue-500/20"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">Você</span>
                      <h4 className="text-sm font-bold text-[#0F172A]">{comparison.me.name}</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-[#64748B] block">Treinos (30d)</span>
                      <span className="text-lg font-black text-[#0F172A]">{comparison.me.workoutsLast30Days}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-[#64748B] block">Sequência Atual</span>
                      <span className="text-lg font-black text-amber-600 flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                        {comparison.me.streak}d
                      </span>
                    </div>
                  </div>
                </div>

                {/* Atleta 2 (Parceiro) */}
                <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <UserAvatar
                      name={comparison.partner.name}
                      image={comparison.partner.image}
                      size="md"
                      className="ring-2 ring-slate-200"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Oponente</span>
                      <h4 className="text-sm font-bold text-[#0F172A]">{comparison.partner.name}</h4>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-[#64748B] block">Treinos (30d)</span>
                      <span className="text-lg font-black text-[#0F172A]">{comparison.partner.workoutsLast30Days}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] text-[#64748B] block">Sequência Atual</span>
                      <span className="text-lg font-black text-amber-600 flex items-center justify-center gap-1">
                        <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                        {comparison.partner.streak}d
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparação Exercício por Exercício */}
              {comparison.exercises && comparison.exercises.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-sm">
                  <h4 className="text-xs font-bold text-[#0F172A] mb-3 uppercase tracking-wider">
                    Recordes de Carga em Exercícios Comuns
                  </h4>
                  <div className="space-y-2">
                    {comparison.exercises.map((ex: ComparisonExerciseItem, idx: number) => {
                      const meWin = ex.myMaxWeight > ex.partnerMaxWeight;
                      const partnerWin = ex.partnerMaxWeight > ex.myMaxWeight;
                      return (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <span className="font-bold text-[#0F172A]">{ex.name}</span>
                          <div className="flex items-center gap-4">
                            <span className={`font-bold ${meWin ? "text-[#2563EB]" : "text-[#64748B]"}`}>
                              {ex.myMaxWeight} kg {meWin && "👑"}
                            </span>
                            <span className="text-slate-300">vs</span>
                            <span className={`font-bold ${partnerWin ? "text-amber-600" : "text-[#64748B]"}`}>
                              {ex.partnerMaxWeight} kg {partnerWin && "👑"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#94A3B8] italic bg-white rounded-3xl border border-[#E2E8F0]">
              Selecione um oponente acima para carregar o comparativo.
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: CRIAR NOVO GRUPO
          ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center text-xl">
                  {newGroupIcon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Criar Novo Grupo</h3>
                  <p className="text-[11px] text-[#64748B]">Sem limite de participantes</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-[#94A3B8] hover:bg-slate-100 hover:text-[#0F172A] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4">
              {/* Escolha do Ícone */}
              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
                  Ícone do Grupo
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewGroupIcon(emoji)}
                      className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                        newGroupIcon === emoji
                          ? "bg-blue-100 border-2 border-[#2563EB] scale-110 shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome do Grupo */}
              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Turma das 06h, Desafio 30 Dias, Amigos da Firma"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-3 min-h-[48px] rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-base md:text-sm text-[#0F172A] transition-all"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Qual é o foco do grupo? Motivação diária, consistência..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-base md:text-sm text-[#0F172A] transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {createSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Criar Grupo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ENTRAR EM GRUPO COM CÓDIGO
          ========================================================================= */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center text-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Entrar em Grupo</h3>
                  <p className="text-[11px] text-[#64748B]">Cole o código de convite enviado por um amigo</p>
                </div>
              </div>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-2 rounded-xl text-[#94A3B8] hover:bg-slate-100 hover:text-[#0F172A] transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {joinError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                {joinError}
              </div>
            )}

            <form onSubmit={handleJoinGroupSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Código de Convite
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: TF-9K2L"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full p-3 min-h-[48px] rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-center font-mono font-black text-base md:text-base tracking-widest text-[#0F172A] uppercase transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={joinSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {joinSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Entrar no Grupo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: MEMBROS E RANKING DO GRUPO
          ========================================================================= */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] max-h-[85vh] flex flex-col">
            {detailLoading && !selectedGroupDetail ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-xs">Carregando grupo...</p>
              </div>
            ) : selectedGroupDetail ? (
              <>
                {/* Header do Grupo */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center text-lg text-slate-600 shrink-0">
                      {selectedGroupDetail.icon ? <span>{selectedGroupDetail.icon}</span> : <Users className="w-5 h-5 text-slate-400" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] leading-tight">
                        {selectedGroupDetail.name}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        {selectedGroupDetail.membersCount} participantes • Criado por {selectedGroupDetail.creatorName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMembersModal(false)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-[#0F172A] transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Código de Convite */}
                <div className="my-4 p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Código de Convite
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0F172A]">
                      {selectedGroupDetail.code}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedGroupDetail.code.trim());
                      setCopiedModalCode(true);
                      setTimeout(() => setCopiedModalCode(false), 2500);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      copiedModalCode
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
                    }`}
                  >
                    {copiedModalCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Lista de Membros / Ranking Interno */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    Ranking de Consistência no Grupo
                  </h4>
                  {detailLoading && (!selectedGroupDetail.members || selectedGroupDetail.members.length === 0) ? (
                    <div className="py-8 flex flex-col items-center justify-center text-[#94A3B8]">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2563EB] mb-2" />
                      <p className="text-xs">Carregando membros e posições...</p>
                    </div>
                  ) : (selectedGroupDetail.members || []).map((member: GroupMemberDetail, idx: number) => (
                    <div
                      key={member.id}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex items-center justify-between transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-6 text-center font-black text-xs ${
                            idx === 0
                              ? "text-amber-500"
                              : idx === 1
                              ? "text-slate-400"
                              : idx === 2
                              ? "text-amber-700"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <UserAvatar
                          name={member.student.name}
                          image={member.student.image}
                          size="sm"
                          className="ring-1 ring-white"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#0F172A]">
                              {member.student.name}
                            </span>
                            {member.role === "CREATOR" && (
                              <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <span className="text-[11px] text-[#64748B]">
                            Nv. {member.student.level} • {member.student.levelTitle}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <span className="text-xs font-bold text-[#0F172A] block">
                            {member.student.workoutsCount} treinos
                          </span>
                          <span className="text-[10px] text-amber-600 font-bold flex items-center justify-end gap-0.5">
                            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {member.student.streak}d streak
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ações de Saída ou Exclusão */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleLeaveGroup(selectedGroupDetail.id, selectedGroupDetail.isCreator)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors"
                  >
                    {selectedGroupDetail.isCreator ? (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Grupo</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sair do Grupo</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowMembersModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-xs transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
