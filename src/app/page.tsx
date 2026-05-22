import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Shield, Trophy, Activity, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Redirecionamento automático no servidor se o usuário já estiver logado
  if (session?.user) {
    if (session.user.role === "TRAINER") {
      redirect("/trainer/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider uppercase text-white">
              Pulse<span className="text-emerald-400">SaaS</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-semibold text-sm transition-all duration-300 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Glows de background */}
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-zinc-800 text-emerald-400 text-xs font-semibold mb-6 tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 fill-emerald-400/20" /> A evolução digital do treino
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-none mb-6">
            Prescrição inteligente. <br />
            <span className="text-gradient">Evolução constante.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Esqueça as fichinhas de papel. Conectamos Personal Trainers e Alunos em uma plataforma premium de alta performance, focada em progressão de cargas e analytics de evolução corporal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 cursor-pointer active:scale-[0.98]"
            >
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-zinc-800 bg-slate-900/30 hover:bg-slate-900/60 text-white font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Ver Demonstração
            </Link>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="bg-emerald-500/10 p-3 rounded-xl w-fit text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">Painel do Treinador</h3>
              <p className="text-sm text-slate-400">
                Monte treinos personalizados com divisão ABCDE, controle templates e acompanhe a consistência e métricas físicas de todos os seus alunos de forma centralizada.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="bg-cyan-500/10 p-3 rounded-xl w-fit text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">Progressão de Carga Inteligente</h3>
              <p className="text-sm text-slate-400">
                Nosso algoritmo inteligente sugere progressão de peso para o aluno quando metas de repetição são atingidas por 2 treinos seguidos, evitando estagnação.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="bg-indigo-500/10 p-3 rounded-xl w-fit text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">Gamificação e Foco</h3>
              <p className="text-sm text-slate-400">
                Os alunos registram cargas pelo celular e ganham XP, badges e recordes pessoais (PRs) a cada avanço físico, aumentando a retenção nas aulas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-950 py-8 bg-slate-950/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} PulseSaaS. Desenvolvido com foco em alta performance.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer">Termos</span>
            <span className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer">Privacidade</span>
            <span className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer">Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
