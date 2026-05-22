"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  Dumbbell,
  LogOut,
  Loader2,
  ChevronLeft,
  Calendar,
  Plus,
  Camera,
  Eye,
  CheckCircle,
  Activity,
  X,
} from "lucide-react";

interface Measurement {
  id: string;
  date: string;
  weight: number;
  bodyFat: number | null;
  chest: number | null;
  waist: number | null;
  armLeft: number | null;
  armRight: number | null;
  thighLeft: number | null;
  thighRight: number | null;
  calfLeft: number | null;
  calfRight: number | null;
  photos: string[];
}

export default function StudentMeasurementsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const studentId = params.id as string;

  // Estados do Aluno
  const [studentName, setStudentName] = useState("");
  const [history, setHistory] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [armLeft, setArmLeft] = useState("");
  const [armRight, setArmRight] = useState("");
  const [thighLeft, setThighLeft] = useState("");
  const [thighRight, setThighRight] = useState("");
  const [calfLeft, setCalfLeft] = useState("");
  const [calfRight, setCalfRight] = useState("");

  // Base64 das Fotos
  const [photoFrente, setPhotoFrente] = useState("");
  const [photoLado, setPhotoLado] = useState("");
  const [photoCostas, setPhotoCostas] = useState("");

  // Ações
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Ampliar Foto Modal
  const [selectedPhotoForZoom, setSelectedPhotoForZoom] = useState("");

  // Carregar dados
  const fetchData = async () => {
    try {
      // 1. Detalhes do Aluno
      const studentResponse = await fetch(`/api/trainer/students/${studentId}`);
      if (!studentResponse.ok) {
        router.push("/trainer/dashboard");
        return;
      }
      const studentData = await studentResponse.json();
      setStudentName(studentData.name);

      // 2. Histórico de Medições
      const measurementsResponse = await fetch(`/api/trainer/students/${studentId}/measurements`);
      if (measurementsResponse.ok) {
        const measurementsData = await measurementsResponse.json();
        setHistory(measurementsData);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId, router]);

  // Converter arquivo de imagem em base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "frente" | "lado" | "costas") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === "frente") setPhotoFrente(base64String);
      if (type === "lado") setPhotoLado(base64String);
      if (type === "costas") setPhotoCostas(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) {
      setError("O peso corporal é obrigatório.");
      return;
    }

    setActionLoading(true);
    setError("");
    setSuccess(false);

    // Agrupar fotos preenchidas
    const photosArray = [];
    if (photoFrente) photosArray.push(photoFrente);
    if (photoLado) photosArray.push(photoLado);
    if (photoCostas) photosArray.push(photoCostas);

    try {
      const response = await fetch(`/api/trainer/students/${studentId}/measurements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: Number(weight),
          bodyFat: bodyFat ? Number(bodyFat) : null,
          chest: chest ? Number(chest) : null,
          waist: waist ? Number(waist) : null,
          armLeft: armLeft ? Number(armLeft) : null,
          armRight: armRight ? Number(armRight) : null,
          thighLeft: thighLeft ? Number(thighLeft) : null,
          thighRight: thighRight ? Number(thighRight) : null,
          calfLeft: calfLeft ? Number(calfLeft) : null,
          calfRight: calfRight ? Number(calfRight) : null,
          photos: photosArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocorreu um erro ao salvar a avaliação.");
        return;
      }

      setSuccess(true);
      // Reset formulário
      setWeight("");
      setBodyFat("");
      setChest("");
      setWaist("");
      setArmLeft("");
      setArmRight("");
      setThighLeft("");
      setThighRight("");
      setCalfLeft("");
      setCalfRight("");
      setPhotoFrente("");
      setPhotoLado("");
      setPhotoCostas("");

      fetchData();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError("Erro de conexão ao salvar.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-zinc-900">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-emerald-500 to-lime-500 p-2 rounded-xl shadow-lg shadow-emerald-500/10">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider uppercase text-zinc-900">
                Tech<span className="text-emerald-500">Fitness</span>
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/trainer/dashboard"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-550 hover:text-zinc-950 transition-colors"
              >
                Alunos
              </Link>
              <Link
                href="/trainer/exercises"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-550 hover:text-zinc-950 transition-colors"
              >
                Exercícios
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-zinc-800">
                {session?.user?.name || "Professor"}
              </p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                Personal Trainer
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2.5 rounded-xl border border-zinc-200 hover:border-red-500/30 hover:bg-red-550/5 text-zinc-500 hover:text-red-650 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Header Contexto */}
      <section className="bg-zinc-100/60 border-b border-zinc-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
          <Link
            href="/trainer/dashboard"
            className="p-2 rounded-lg border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-550 hover:text-zinc-900 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="font-display text-xl font-bold text-zinc-900">
              {loading ? "Carregando avaliação..." : `Avaliação Física: ${studentName}`}
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Registre dobras e medidas de composição corporal.</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
          <p className="text-sm">Buscando histórico físico...</p>
        </div>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
          
          {/* Coluna Esquerda: Nova Avaliação (Formulário) */}
          <section className="w-full lg:w-5/12">
            <div className="glass-card rounded-2xl p-6 border border-zinc-200 bg-white shadow-sm">
              <h3 className="font-display font-semibold text-sm text-zinc-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-500" /> Nova Medição
              </h3>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-750 text-xs text-center font-semibold">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-250 text-emerald-700 text-xs text-center font-semibold animate-pulse">
                  Avaliação física salva com sucesso!
                </div>
              )}

              <form onSubmit={handleSaveMeasurement} className="space-y-4">
                {/* Composição Corporal Geral */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Peso Corporal (kg)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Ex: 78.5"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Gordura Corporal - BF (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      placeholder="Ex: 12.4"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Perímetros Superiores */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Peitoral (cm)</label>
                    <input
                      type="number"
                      step="any"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      placeholder="Ex: 102"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Cintura (cm)</label>
                    <input
                      type="number"
                      step="any"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder="Ex: 82"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Braço Esquerdo (cm)</label>
                    <input
                      type="number"
                      step="any"
                      value={armLeft}
                      onChange={(e) => setArmLeft(e.target.value)}
                      placeholder="Ex: 38.5"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Braço Direito (cm)</label>
                    <input
                      type="number"
                      step="any"
                      value={armRight}
                      onChange={(e) => setArmRight(e.target.value)}
                      placeholder="Ex: 39"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Perímetros Inferiores */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Coxa Esquerda (cm)</label>
                    <input
                      type="number"
                      step="any"
                      value={thighLeft}
                      onChange={(e) => setThighLeft(e.target.value)}
                      placeholder="Ex: 58"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Coxa Direita (cm)</label>
                    <input
                      type="number"
                      step="any"
                      value={thighRight}
                      onChange={(e) => setThighRight(e.target.value)}
                      placeholder="Ex: 58.5"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Panturrilha Esq. (cm)</label>
                    <input
                      type="number"
                      step="any"
                      value={calfLeft}
                      onChange={(e) => setCalfLeft(e.target.value)}
                      placeholder="Ex: 38"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Panturrilha Dir. (cm)</label>
                    <input
                      type="number"
                      step="any"
                      value={calfRight}
                      onChange={(e) => setCalfRight(e.target.value)}
                      placeholder="Ex: 38"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-zinc-200 focus:border-emerald-500 outline-none text-xs text-zinc-800 placeholder-zinc-450 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Upload de Fotos Comparativas */}
                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Fotos Comparativas (Opcional)</label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Frente */}
                    <div className="flex flex-col items-center">
                      <label className="w-full aspect-square rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-350 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden">
                        {photoFrente ? (
                          <img src={photoFrente} alt="Frente" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-5 h-5 text-zinc-400" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, "frente")}
                        />
                      </label>
                      <span className="text-[8px] text-zinc-500 font-bold mt-1.5 uppercase tracking-wider">Frente</span>
                    </div>

                    {/* Lado */}
                    <div className="flex flex-col items-center">
                      <label className="w-full aspect-square rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-350 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden">
                        {photoLado ? (
                          <img src={photoLado} alt="Lado" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-5 h-5 text-zinc-400" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, "lado")}
                        />
                      </label>
                      <span className="text-[8px] text-zinc-500 font-bold mt-1.5 uppercase tracking-wider">Lado</span>
                    </div>

                    {/* Costas */}
                    <div className="flex flex-col items-center">
                      <label className="w-full aspect-square rounded-xl bg-zinc-50 border border-zinc-200 hover:border-zinc-350 transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden">
                        {photoCostas ? (
                          <img src={photoCostas} alt="Costas" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-5 h-5 text-zinc-400" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, "costas")}
                        />
                      </label>
                      <span className="text-[8px] text-zinc-500 font-bold mt-1.5 uppercase tracking-wider">Costas</span>
                    </div>
                  </div>
                </div>

                {/* Botão de Envio */}
                <button
                  type="submit"
                  disabled={actionLoading || success}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-4"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <>
                      Salvar Avaliação
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Coluna Direita: Histórico de Avaliações */}
          <section className="w-full lg:w-7/12 space-y-6">
            <h3 className="text-xs font-bold text-zinc-550 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" /> Histórico de Medidas ({history.length})
            </h3>

            {history.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center text-zinc-450 border border-zinc-200 bg-white shadow-sm">
                <Activity className="w-10 h-10 mx-auto text-zinc-300 mb-3" />
                <p className="text-xs font-semibold text-zinc-800">Nenhuma medição registrada</p>
                <p className="text-[10px] mt-0.5 text-zinc-500">Registre a primeira medição do seu aluno na coluna ao lado.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {history.map((m) => (
                  <div
                    key={m.id}
                    className="glass-card rounded-2xl p-5 border border-zinc-200 bg-white space-y-4 shadow-sm hover:border-emerald-500/30 transition-all duration-300"
                  >
                    {/* Header do Card */}
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h4 className="text-xs font-bold text-zinc-900">{formatDate(m.date)}</h4>
                      </div>
                      <span className="font-mono text-xs font-bold text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        {m.weight}kg
                      </span>
                    </div>

                    {/* Grid de Medidas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-zinc-650">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-semibold">BF (Gordura)</span>
                        <span className="text-zinc-900 font-mono font-bold">{m.bodyFat !== null ? `${m.bodyFat}%` : "--"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-semibold">Peitoral</span>
                        <span className="text-zinc-900 font-mono font-bold">{m.chest !== null ? `${m.chest}cm` : "--"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-semibold">Cintura</span>
                        <span className="text-zinc-900 font-mono font-bold">{m.waist !== null ? `${m.waist}cm` : "--"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-semibold">Braços (E/D)</span>
                        <span className="text-zinc-900 font-mono font-bold">
                          {m.armLeft !== null && m.armRight !== null
                            ? `${m.armLeft} / ${m.armRight}cm`
                            : "--"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-semibold">Coxas (E/D)</span>
                        <span className="text-zinc-900 font-mono font-bold">
                          {m.thighLeft !== null && m.thighRight !== null
                            ? `${m.thighLeft} / ${m.thighRight}cm`
                            : "--"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-semibold">Panturrilhas (E/D)</span>
                        <span className="text-zinc-900 font-mono font-bold">
                          {m.calfLeft !== null && m.calfRight !== null
                            ? `${m.calfLeft} / ${m.calfRight}cm`
                            : "--"}
                        </span>
                      </div>
                    </div>

                    {/* Exibir Fotos Comparativas Se Houver */}
                    {m.photos && m.photos.length > 0 && (
                      <div className="pt-3 border-t border-zinc-100">
                        <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-semibold mb-2 font-display">Fotos Comparativas</span>
                        <div className="flex gap-2">
                          {m.photos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => setSelectedPhotoForZoom(photo)}
                              className="w-14 h-14 rounded-lg bg-zinc-50 border border-zinc-200 overflow-hidden relative cursor-zoom-in hover:border-emerald-500 transition-all"
                            >
                              <img src={photo} alt={`Foto ${pIdx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Modal Zoom Foto */}
      {selectedPhotoForZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-sm max-h-[80vh] w-full flex items-center justify-center">
            <button
              onClick={() => setSelectedPhotoForZoom("")}
              className="absolute -top-12 right-0 p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhotoForZoom}
              alt="Ampliada"
              className="max-w-full max-h-[70vh] rounded-2xl object-contain border border-zinc-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}
