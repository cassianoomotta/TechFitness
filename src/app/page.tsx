import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Shield, Trophy, Activity, ArrowRight, Zap } from "lucide-react";

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
    <div className="flex-1 flex flex-col bg-zinc-950 text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-cyan-500 to-indigo-500 p-2 rounded-xl shadow-lg shadow-cyan-500/10">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-wider uppercase text-zinc-100">
              Tech<span className="text-cyan-500">Fitness</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-500 hover:text-zinc-100 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-zinc-900/10 cursor-pointer active:scale-95"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden flex-1 flex flex-col justify-center bg-zinc-900">
        {/* Glows de background esportivos */}
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800/80 text-cyan-400 text-xs font-semibold mb-6 tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 fill-cyan-500/10" /> A evolução digital do treino
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-100 tracking-tight leading-none mb-6">
            Prescrição inteligente. <br />
            <span className="text-gradient">Evolução constante.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Esqueça as fichinhas de papel. Conectamos Personal Trainers e Alunos em uma plataforma premium de alta performance, focada em progressão de cargas e analytics de evolução corporal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 cursor-pointer active:scale-[0.98]"
            >
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-zinc-800 bg-zinc-50 hover:bg-zinc-900 text-zinc-200 font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Ver Demonstração
            </Link>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="bg-cyan-500/10 p-3 rounded-xl w-fit text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-zinc-100 mb-2">Painel do Treinador</h3>
              <p className="text-sm text-zinc-500">
                Monte treinos personalizados com divisão ABCDE, controle templates e acompanhe a consistência e métricas físicas de todos os seus alunos de forma centralizada.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="bg-indigo-500/10 p-3 rounded-xl w-fit text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-zinc-100 mb-2">Progressão de Carga Inteligente</h3>
              <p className="text-sm text-zinc-500">
                Nosso algoritmo inteligente sugere progressão de peso para o aluno quando metas de repetição são atingidas por 2 treinos seguidos, evitando estagnação.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="bg-zinc-900 p-3 rounded-xl w-fit text-zinc-350 mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-zinc-100 mb-2">Treino em Dupla</h3>
              <p className="text-sm text-zinc-500">
                Os alunos podem comparar o seu desempenho e cargas máximas diretamente com seus parceiros de treino, promovendo motivação mútua e engajamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 bg-zinc-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} TechFitness. Desenvolvido com foco em alta performance.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-zinc-500 hover:text-zinc-500 transition-colors cursor-pointer">Termos</span>
            <span className="text-xs text-zinc-500 hover:text-zinc-500 transition-colors cursor-pointer">Privacidade</span>
            <span className="text-xs text-zinc-500 hover:text-zinc-500 transition-colors cursor-pointer">Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
