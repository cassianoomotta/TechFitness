"use client";

import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { Shield, Trophy, Activity, ArrowRight, Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function Home() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#0F172A] dark:text-white selection:bg-[#2563EB]/20 selection:text-[#1D4ED8] transition-colors duration-200 min-h-screen">
      {/* Header com suporte a Safe Area */}
      <header 
        className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50 pt-safe transition-colors"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <BrandLogo size={36} />

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Alternância Rápida de Tema */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2.5 min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151D2F] hover:border-[#2563EB]/40 dark:hover:border-[#38BDF8]/40 text-slate-600 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-[#38BDF8] transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-2xs"
              title={resolvedTheme === "dark" ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              aria-label="Alternar tema de cores"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-blue-500/15 cursor-pointer active:scale-95"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden flex-1 flex flex-col justify-center bg-white dark:bg-[#0B0F19] transition-colors">
        {/* Glows de background esportivos */}
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#2563EB]/5 dark:bg-[#2563EB]/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#1E40AF]/5 dark:bg-[#00C2FF]/5 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-[#2563EB] dark:text-[#38BDF8] text-xs font-semibold mb-6 tracking-wide uppercase shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-[#2563EB]/10" /> A evolução digital do treino
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-none mb-6">
            Prescrição inteligente. <br />
            <span className="text-gradient">Evolução constante.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Esqueça as fichinhas de papel. Conectamos Personal Trainers e Alunos em uma plataforma premium de alta performance, focada em progressão de cargas e métricas de evolução corporal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
            >
              <span>Criar Conta Grátis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-white dark:bg-[#151D2F] dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-white font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              Já tenho conta
            </Link>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#151D2F]/90 backdrop-blur-md relative overflow-hidden group hover:border-[#2563EB]/40 dark:hover:border-[#38BDF8]/40 transition-all">
              <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-xl w-fit text-[#2563EB] dark:text-[#38BDF8] mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-white mb-2">Painel do Treinador</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Monte treinos personalizados com divisão ABCDE, controle templates e acompanhe a consistência e métricas físicas de todos os seus alunos de forma centralizada.
              </p>
            </div>

            <div className="rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#151D2F]/90 backdrop-blur-md relative overflow-hidden group hover:border-[#2563EB]/40 dark:hover:border-[#38BDF8]/40 transition-all">
              <div className="bg-cyan-50 dark:bg-cyan-950/50 p-3 rounded-xl w-fit text-[#00C2FF] mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-white mb-2">Progressão de Carga Inteligente</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Nosso algoritmo inteligente sugere progressão de peso para o aluno quando metas de repetição são atingidas por 2 treinos seguidos, evitando estagnação.
              </p>
            </div>

            <div className="rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-[#151D2F]/90 backdrop-blur-md relative overflow-hidden group hover:border-[#2563EB]/40 dark:hover:border-[#38BDF8]/40 transition-all">
              <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-xl w-fit text-amber-600 dark:text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-white mb-2">Treino em Dupla</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Os alunos podem comparar o seu desempenho e cargas máximas diretamente com seus parceiros de treino, promovendo motivação mútua e engajamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-slate-50 dark:bg-[#0B0F19] mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} TechFitness. Desenvolvido com foco em alta performance.
          </p>
          <div className="flex gap-6">
            <button onClick={() => alert("Página de Termos em construção")} className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-[#38BDF8] transition-colors cursor-pointer">Termos</button>
            <button onClick={() => alert("Página de Privacidade em construção")} className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-[#38BDF8] transition-colors cursor-pointer">Privacidade</button>
            <button onClick={() => alert("Entre em contato: suporte@techfitness.com.br")} className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#2563EB] dark:hover:text-[#38BDF8] transition-colors cursor-pointer">Suporte</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
