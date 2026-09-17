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
  membersCount: number;
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
  createdAt: string;
  isCreator: boolean;
  membersCount: number;
  members: GroupMemberDetail[];
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
}

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
}: GroupsTabProps) {
  // Aba interna do componente: Feed Social vs Gerenciar Grupos vs Duelo 1-a-1
  const [internalTab, setInternalTab] = useState<"feed" | "groups" | "duel">("feed");

  // Dados dos grupos e timeline
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelinePost[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");

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

  // Reações locais simuladas
  const [postReactions, setPostReactions] = useState<Record<string, { fire: number; muscle: number; clap: number; reacted: string | null }>>({});

  // Ícones disponíveis para personalização do grupo
  const EMOJI_OPTIONS = ["🏋️", "⚡", "🔥", "🥊", "🚴", "🏃", "🏆", "🥇", "💥", "💪", "⚔️", "🎯"];

  // Carregar grupos do usuário
  const fetchUserGroups = async () => {
    setGroupsLoading(true);
    try {
      const res = await fetch("/api/student/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error("Erro ao carregar grupos:", err);
    } finally {
      setGroupsLoading(false);
    }
  };

  // Carregar timeline centralizada com base no filtro selecionado
  const fetchTimeline = async (groupId: string = "all") => {
    setTimelineLoading(true);
    try {
      const url =
        groupId && groupId !== "all"
          ? `/api/student/groups/timeline?groupId=${groupId}`
          : "/api/student/groups/timeline";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data.timeline || []);
      }
    } catch (err) {
      console.error("Erro ao buscar timeline dos grupos:", err);
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
    fetchTimeline("all");
  }, []);

  // Recarregar timeline ao mudar filtro de grupo
  const handleGroupFilterChange = (groupId: string) => {
    setSelectedGroupId(groupId);
    fetchTimeline(groupId);
  };

  // Copiar código de convite
  const handleCopyInviteCode = (group: GroupSummary) => {
    const text = `Bora treinar juntos no TechFitness! Entre no meu grupo "${group.name}" com o código: ${group.code}`;
    navigator.clipboard.writeText(text);
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
        // Recarregar grupos e timeline
        await fetchUserGroups();
        await fetchTimeline(data.group.id);
        setSelectedGroupId(data.group.id);
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
    if (!joinCode.trim()) {
      setJoinError("Informe o código de convite.");
      return;
    }

    setJoinSubmitting(true);
    try {
      const res = await fetch("/api/student/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || "Código inválido ou erro ao entrar no grupo.");
      } else {
        setShowJoinModal(false);
        setJoinCode("");
        await fetchUserGroups();
        await fetchTimeline(data.group?.id || "all");
        if (data.group?.id) setSelectedGroupId(data.group.id);
      }
    } catch (err) {
      setJoinError("Erro de conexão ao entrar no grupo.");
    } finally {
      setJoinSubmitting(false);
    }
  };

  // Abrir detalhes de membros do grupo
  const handleOpenGroupDetails = async (groupId: string) => {
    setShowMembersModal(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/student/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedGroupDetail(data.group);
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
        await fetchUserGroups();
        await fetchTimeline("all");
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
      <div className="bg-white/80 backdrop-blur-md border border-[#E2E8F0] p-3 sm:p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
        {/* Toggle de Sub-Abas com Scroll Suave no Mobile e Zero Quebras de Linha */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => setInternalTab("feed")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              internalTab === "feed"
                ? "bg-white text-[#2563EB] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span>Mural</span>
          </button>
          <button
            onClick={() => setInternalTab("groups")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              internalTab === "groups"
                ? "bg-white text-[#2563EB] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Grupos</span>
            {groups.length > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold leading-none ${
                  internalTab === "groups"
                    ? "bg-blue-100 text-[#2563EB]"
                    : "bg-slate-200/80 text-[#64748B]"
                }`}
              >
                {groups.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setInternalTab("duel")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              internalTab === "duel"
                ? "bg-white text-[#2563EB] shadow-sm"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Swords className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Duelo</span>
          </button>
        </div>

        {/* Botões de Ação Rápida: Criar E Entrar (100% contidos na moldura) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={() => setShowJoinModal(true)}
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span>Entrar com Código</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 hover:scale-[1.02] whitespace-nowrap"
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
          {/* Pílulas de Filtro por Grupo */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none py-1">
            <button
              onClick={() => handleGroupFilterChange("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                selectedGroupId === "all"
                  ? "bg-gradient-to-r from-[#2563EB] to-blue-600 text-white border-transparent shadow-sm shadow-blue-500/25"
                  : "bg-white/90 backdrop-blur-sm text-[#64748B] border-slate-200 hover:bg-slate-50 hover:text-[#0F172A]"
              }`}
            >
              <span>🌐</span>
              <span>Todos os Grupos</span>
            </button>

            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() => handleGroupFilterChange(group.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                  selectedGroupId === group.id
                    ? "bg-gradient-to-r from-[#2563EB] to-blue-600 text-white border-transparent shadow-sm shadow-blue-500/25"
                    : "bg-white/90 backdrop-blur-sm text-[#64748B] border-slate-200 hover:bg-slate-50 hover:text-[#0F172A]"
                }`}
              >
                <span>{group.icon || "🏋️"}</span>
                <span>{group.name}</span>
              </button>
            ))}

            {groups.length === 0 && !groupsLoading && (
              <div className="text-xs text-[#94A3B8] italic flex items-center gap-1.5 px-3">
                <Info className="w-3.5 h-3.5" />
                Crie ou participe de um grupo para ver treinos no mural!
              </div>
            )}
          </div>

          {/* Estado de Carregamento da Timeline */}
          {timelineLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
              <p className="text-xs font-medium">Sincronizando mural da comunidade...</p>
            </div>
          ) : timeline.length === 0 ? (
            /* Estado Vazio */
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">
                Nenhum check-in postado ainda!
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                Seja o pioneiro da sua turma: finalize seu treino hoje, tire uma foto de check-in e inspire seus amigos de grupo!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar um Grupo
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition-all border border-slate-200 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-[#2563EB]" />
                  Entrar com Código
                </button>
              </div>
            </div>
          ) : (
            /* Lista de Posts da Timeline (Cards Instagram / Glassmorphism) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {timeline.map((post) => {
                const reactions = postReactions[post.id] || { fire: 4, muscle: 2, clap: 1, reacted: null };
                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Topo do Post: Atleta + BADGE PROEMINENTE DO GRUPO */}
                    <div className="p-4 sm:p-5 border-b border-slate-100">
                      {/* Badge PROEMINENTE de identificação de qual Grupo o check-in pertence */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3">
                        {post.groups.length > 0 ? (
                          post.groups.map((g) => (
                            <span
                              key={g.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-200/70 text-[#2563EB] text-[11px] font-extrabold tracking-wide shadow-2xs"
                            >
                              <span>{g.icon || "🏋️"}</span>
                              <span>{g.name}</span>
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-[#64748B] text-[10px] font-bold">
                            🏋️ Treino Individual
                          </span>
                        )}

                        {post.isMe && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                            Você
                          </span>
                        )}
                      </div>

                      {/* Informações do Atleta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={post.student.name}
                            image={post.student.image}
                            size="md"
                            className="ring-2 ring-blue-500/20 shadow-sm"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-[#0F172A] leading-tight">
                                {post.student.name}
                              </h4>
                              <span className="text-xs" title={`Tier: ${post.student.tierName}`}>
                                {post.student.tierBadge}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#64748B]">
                              <span className="font-semibold text-[#2563EB]">
                                Nv. {post.student.level} • {post.student.levelTitle}
                              </span>
                              <span>•</span>
                              <span>{formatPostTime(post.date)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Streak */}
                        {post.student.streak > 0 && (
                          <div
                            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shadow-2xs"
                            title={`${post.student.streak} dias consecutivos de treino`}
                          >
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{post.student.streak}d</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Foto do Check-in (Padrão Instagram / Glassmorphism) */}
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                        {/* Overlay: Tempo de Duração e Satisfação */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            {post.durationMs ? (
                              <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px]">
                                <Clock className="w-3 h-3 text-blue-400" />
                                <span>{Math.round(post.durationMs / 60000)} min</span>
                              </div>
                            ) : null}

                            {post.satisfaction ? (
                              <div className="flex items-center gap-0.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] text-amber-400">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>{post.satisfaction}/5</span>
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
                      /* Sem foto: Card visual estilizado */
                      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/40 border-b border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#2563EB]">
                          <Dumbbell className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#0F172A]">Treino Concluído com Sucesso! 🚀</p>
                          <p className="text-[11px] text-[#64748B]">
                            {post.durationMs
                              ? `${Math.round(post.durationMs / 60000)} minutos de dedicação total.`
                              : "Mais um dia de consistência garantido."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Resumo dos Exercícios */}
                    {post.exercises && post.exercises.length > 0 && (
                      <div className="p-4 bg-slate-50/60 border-b border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#64748B] mb-2 uppercase tracking-wider">
                          <Dumbbell className="w-3.5 h-3.5 text-[#2563EB]" />
                          <span>Destaques da Sessão ({post.exercisesCount} exercícios)</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {post.exercises.slice(0, 3).map((ex, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-lg bg-white border border-[#E2E8F0] text-[11px] font-semibold text-[#0F172A] shadow-2xs"
                            >
                              {ex.name} {ex.maxWeight > 0 ? `• ${ex.maxWeight}kg` : ""}
                            </span>
                          ))}
                          {post.exercises.length > 3 && (
                            <span className="px-2 py-1 rounded-lg bg-slate-200/70 text-[11px] font-bold text-[#64748B]">
                              +{post.exercises.length - 3} mais
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rodapé do Post: Reações Interativas */}
                    <div className="p-3 sm:p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Botão Fogo */}
                        <button
                          onClick={() => handleReact(post.id, "fire")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            reactions.reacted === "fire"
                              ? "bg-amber-100 text-amber-800 border border-amber-300 scale-105"
                              : "bg-slate-100 hover:bg-amber-50 text-[#64748B] hover:text-amber-700"
                          }`}
                        >
                          <span>🔥</span>
                          <span>{reactions.fire}</span>
                        </button>

                        {/* Botão Músculo */}
                        <button
                          onClick={() => handleReact(post.id, "muscle")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            reactions.reacted === "muscle"
                              ? "bg-blue-100 text-[#2563EB] border border-blue-300 scale-105"
                              : "bg-slate-100 hover:bg-blue-50 text-[#64748B] hover:text-[#2563EB]"
                          }`}
                        >
                          <span>💪</span>
                          <span>{reactions.muscle}</span>
                        </button>

                        {/* Botão Palmas */}
                        <button
                          onClick={() => handleReact(post.id, "clap")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            reactions.reacted === "clap"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 scale-105"
                              : "bg-slate-100 hover:bg-emerald-50 text-[#64748B] hover:text-emerald-700"
                          }`}
                        >
                          <span>👏</span>
                          <span>{reactions.clap}</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-[#94A3B8] font-medium">
                        {post.satisfaction ? `Nota ${post.satisfaction} ⭐` : "Check-in confirmado"}
                      </span>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Seus Grupos de Treino</h3>
              <p className="text-xs text-[#64748B]">
                Participe de turmas ilimitadas, convide amigos e acompanhe o ranking interno.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold text-xs transition-all border border-slate-200 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#2563EB]" />
                Entrar com Código
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Grupo
              </button>
            </div>
          </div>

          {groupsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
              <p className="text-xs">Carregando seus grupos...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1">Você não está em nenhum grupo</h3>
              <p className="text-xs text-[#64748B] leading-relaxed mb-6">
                Crie um grupo para sua turma da academia, amigos do trabalho ou clube de corrida. Não há limite de participantes!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeiro Grupo
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-semibold transition-all border border-slate-200 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-[#2563EB]" />
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
                    className="bg-white rounded-3xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Topo do Card do Grupo */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shadow-2xs shrink-0">
                            {group.icon || "🏋️"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-[#0F172A] leading-tight truncate">
                              {group.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                                <Users className="w-3 h-3 text-[#2563EB] shrink-0" />
                                {group.membersCount} {group.membersCount === 1 ? "membro" : "membros"}
                              </span>
                            </div>
                          </div>
                        </div>
                        {group.isCreator && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-2xs">
                            <Crown className="w-3 h-3 fill-amber-500 text-amber-500" />
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
                        <div className="flex items-center gap-1.5 mb-4 py-2 px-3 rounded-2xl bg-slate-50 border border-slate-100">
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
                      <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3 mb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">
                            Código de Convite
                          </span>
                          <span className="text-xs font-mono font-bold text-[#0F172A]">
                            {group.code}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopyInviteCode(group)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isCopied
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-white hover:bg-blue-600 hover:text-white text-[#2563EB] border border-blue-200 shadow-2xs"
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
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Botão de Ver Membros / Gerenciar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenGroupDetails(group.id)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-[#2563EB] hover:text-white text-[#0F172A] font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Ver Membros E Ranking
                      </button>
                      <button
                        onClick={() => handleLeaveGroup(group.id, !!group.isCreator)}
                        className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all"
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
                  className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
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
                    className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
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
                  className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all"
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
                  className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-xs text-[#0F172A] transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-semibold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
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
                  className="w-full p-3 rounded-xl bg-white border border-[#E2E8F0] focus:border-[#2563EB] outline-none text-center font-mono font-black text-sm tracking-widest text-[#0F172A] uppercase transition-all"
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
            {detailLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-xs">Carregando ranking do grupo...</p>
              </div>
            ) : selectedGroupDetail ? (
              <>
                {/* Header do Grupo */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl">
                      {selectedGroupDetail.icon || "🏋️"}
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
                    className="p-2 rounded-xl text-[#94A3B8] hover:bg-slate-100 hover:text-[#0F172A] transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Código de Convite */}
                <div className="my-4 p-3 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">
                      Código de Convite
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0F172A]">
                      {selectedGroupDetail.code}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `Entre no grupo "${selectedGroupDetail.name}" com o código: ${selectedGroupDetail.code}`
                      );
                      alert("Código de convite copiado com sucesso!");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-600 hover:text-white text-[#2563EB] text-xs font-bold border border-blue-200 transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Convite</span>
                  </button>
                </div>

                {/* Lista de Membros / Ranking Interno */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                    Ranking de Consistência no Grupo
                  </h4>
                  {selectedGroupDetail.members.map((member, idx) => (
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
