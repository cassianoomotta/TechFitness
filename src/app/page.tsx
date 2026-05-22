import BrandLogo from "@/components/BrandLogo";
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
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-[#2563EB]/20 selection:text-[#1D4ED8]">
      {/* Header */}
      <header className="border-b border-[#E2E8F0]/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <BrandLogo size={36} />

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#94A3B8] hover:text-[#0F172A] transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-800 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-zinc-900/10 cursor-pointer active:scale-95"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden flex-1 flex flex-col justify-center bg-white">
        {/* Glows de background esportivos */}
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-[#2563EB]/5 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#1E40AF]/5 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E2E8F0]/80 text-[#2563EB] text-xs font-semibold mb-6 tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 fill-[#2563EB]/10" /> A evolução digital do treino
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0F172A] tracking-tight leading-none mb-6">
            Prescrição inteligente. <br />
            <span className="text-gradient">Evolução constante.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Esqueça as fichinhas de papel. Conectamos Personal Trainers e Alunos em uma plataforma premium de alta performance, focada em progressão de cargas e analytics de evolução corporal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer active:scale-[0.98]"
            >
              Criar Conta Grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[#E2E8F0] bg-zinc-50 hover:bg-white text-[#0F172A] font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Ver Demonstração
            </Link>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="bg-[#2563EB]/10 p-3 rounded-xl w-fit text-[#2563EB] mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#0F172A] mb-2">Painel do Treinador</h3>
              <p className="text-sm text-[#94A3B8]">
                Monte treinos personalizados com divisão ABCDE, controle templates e acompanhe a consistência e métricas físicas de todos os seus alunos de forma centralizada.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="bg-[#1E40AF]/10 p-3 rounded-xl w-fit text-[#1E40AF] mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#0F172A] mb-2">Progressão de Carga Inteligente</h3>
              <p className="text-sm text-[#94A3B8]">
                Nosso algoritmo inteligente sugere progressão de peso para o aluno quando metas de repetição são atingidas por 2 treinos seguidos, evitando estagnação.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="bg-white p-3 rounded-xl w-fit text-[#475569] mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#0F172A] mb-2">Treino em Dupla</h3>
              <p className="text-sm text-[#94A3B8]">
                Os alunos podem comparar o seu desempenho e cargas máximas diretamente com seus parceiros de treino, promovendo motivação mútua e engajamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-8 bg-zinc-50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#94A3B8]">
            &copy; {new Date().getFullYear()} TechFitness. Desenvolvido com foco em alta performance.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-[#94A3B8] hover:text-[#94A3B8] transition-colors cursor-pointer">Termos</span>
            <span className="text-xs text-[#94A3B8] hover:text-[#94A3B8] transition-colors cursor-pointer">Privacidade</span>
            <span className="text-xs text-[#94A3B8] hover:text-[#94A3B8] transition-colors cursor-pointer">Suporte</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
