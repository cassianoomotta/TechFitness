"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  X,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { RegisteredUserItem } from "@/app/api/student/registered-users/route";

interface RegisteredUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisteredUsersModal({
  isOpen,
  onClose,
}: RegisteredUsersModalProps) {
  const [users, setUsers] = useState<RegisteredUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/registered-users");
      if (res.ok) {
        const data = (await res.json()) as { users: RegisteredUserItem[] };
        setUsers(data.users || []);
      }
    } catch (err: unknown) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.trainerName && u.trainerName.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#151D2F] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[#2563EB] dark:text-blue-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white leading-tight">
                  Atletas que Ingressaram no App
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800/60">
                  Administrador
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Visualização exclusiva de todos os novos membros cadastrados na plataforma.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                fetchUsers();
              }}
              disabled={loading || refreshing}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1E293B] transition-all cursor-pointer disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-600 dark:text-blue-400" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Busca e Estatísticas Rápidas */}
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail ou treinador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-base md:text-sm text-[#0F172A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#64748B] dark:text-slate-400 font-semibold">
                Total de Atletas:
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-black border border-slate-700/60">
                {users.length}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {loading && !refreshing ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-2" />
              <p className="text-xs font-medium">Buscando atletas cadastrados...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500">
              <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Nenhum atleta encontrado</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {searchQuery ? "Tente buscar com outro termo." : "Ainda não há outros atletas cadastrados."}
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const regDate = new Date(u.createdAt);
              const formattedDate = regDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={u.id}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-700/60 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar name={u.name} image={u.image} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#0F172A] dark:text-white leading-snug">
                          {u.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/60">
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 font-mono mt-0.5">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs self-end sm:self-center">
                    {/* Treinador Vinculado */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block leading-none">
                        Assessoria
                      </span>
                      <span
                        className={`font-semibold text-xs ${
                          u.trainerName ? "text-[#0F172A] dark:text-slate-200" : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {u.trainerName || "Livre / Sem Treinador"}
                      </span>
                    </div>

                    {/* Data de Ingresso */}
                    <div className="text-right pl-3 border-l border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block leading-none">
                        Ingresso
                      </span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Notificações automáticas ativadas para o seu e-mail.</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-slate-800 text-[#0F172A] dark:text-white font-bold text-xs transition-all cursor-pointer min-h-[44px]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
