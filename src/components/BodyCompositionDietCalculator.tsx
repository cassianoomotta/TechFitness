"use client";

import React, { useState, useMemo } from "react";
import {
  Flame,
  Activity,
  Scale,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Apple,
  Dumbbell,
  Loader2,
  TrendingDown,
  TrendingUp,
  Compass,
} from "lucide-react";
import BodySilhouetteGraphic from "@/components/BodySilhouetteGraphic";

interface BodyCompositionDietCalculatorProps {
  initialWeight?: number;
  onSaved?: () => void;
  onClose?: () => void;
}

type SexType = "male" | "female";
type BiotypeType = "ecto" | "meso" | "endo";
type ActivityLevel = "sedentary" | "light" | "moderate" | "intense" | "athlete";
type DietGoal = "cutting" | "maintenance" | "bulking";

export default function BodyCompositionDietCalculator({
  initialWeight,
  onSaved,
  onClose,
}: BodyCompositionDietCalculatorProps) {
  // Entradas do formulário
  const [sex, setSex] = useState<SexType>("male");
  const [biotype, setBiotype] = useState<BiotypeType>("meso");
  const [age, setAge] = useState<string>("28");
  const [height, setHeight] = useState<string>("175");
  const [weight, setWeight] = useState<string>(initialWeight ? String(initialWeight) : "76");
  const [waist, setWaist] = useState<string>("84");
  const [neck, setNeck] = useState<string>("38");
  const [hip, setHip] = useState<string>("98"); // Apenas para mulheres
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [dietGoal, setDietGoal] = useState<DietGoal>("cutting");

  // Estado de salvamento
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Cálculos reativos (Fórmulas Gorgonoid / Marinha dos EUA e Harris-Benedict com suporte a modo estimado)
  const calculation = useMemo(() => {
    const numAge = parseFloat(age) || 0;
    const numHeight = parseFloat(height) || 0;
    const numWeight = parseFloat(weight) || 0;
    const numWaist = parseFloat(waist) || 0;
    const numNeck = parseFloat(neck) || 0;
    const numHip = parseFloat(hip) || 0;

    // Altura, Peso e Idade são os requisitos mínimos universais
    if (numHeight <= 0 || numWeight <= 0 || numAge <= 0) {
      return null;
    }

    let bf = 0;
    let calculationMode: "navy" | "estimated" = "estimated";

    // 1. Verificar se possui dados de fita métrica suficientes para a fórmula oficial Gorgonoid (Marinha dos EUA)
    const hasTapeMeasurements =
      numWaist > 0 && numNeck > 0 && (sex === "male" || numHip > 0);

    if (hasTapeMeasurements) {
      if (sex === "male") {
        const waistMinusNeck = numWaist - numNeck;
        if (waistMinusNeck > 0) {
          const logDiff = Math.log10(waistMinusNeck);
          const logHeight = Math.log10(numHeight);
          bf = 495 / (1.0324 - 0.19077 * logDiff + 0.15456 * logHeight) - 450 + 2;
          calculationMode = "navy";
        }
      } else {
        const circSum = numWaist + numHip - numNeck;
        if (circSum > 0) {
          const logCirc = Math.log10(circSum);
          const logHeight = Math.log10(numHeight);
          bf = 495 / (1.29579 - 0.35004 * logCirc + 0.221 * logHeight) - 450;
          calculationMode = "navy";
        }
      }
    }

    // Se não tiver fita ou medidas derem valor incoerente, ativa o cálculo estimado por IMC e Biotipo
    if (calculationMode === "estimated" || bf <= 0) {
      const heightInMeters = numHeight / 100;
      const imc = numWeight / (heightInMeters * heightInMeters);
      const sexFactor = sex === "male" ? 1 : 0;
      // Fórmula de Deurenberg: %BF = 1.20 * IMC + 0.23 * idade - 10.8 * sexo - 5.4
      let baseBf = 1.2 * imc + 0.23 * numAge - 10.8 * sexFactor - 5.4;
      if (biotype === "endo") baseBf *= 1.1;
      else if (biotype === "ecto") baseBf *= 0.9;
      bf = baseBf;
      calculationMode = "estimated";
    }

    // Normalização científica dos limites de BF
    bf = Math.max(3, Math.min(55, bf));

    // 2. Massa Gorda e Massa Magra
    const fatMass = numWeight * (bf / 100);
    const leanMass = Math.max(0, numWeight - fatMass);

    // 3. Taxa Metabólica Basal (TMB) com Fator de Biotipo
    let tmb = 0;
    if (sex === "male") {
      const baseTmb = 66.5 + 14 * numWeight + 5 * numHeight - 6.7 * numAge;
      if (biotype === "endo") tmb = baseTmb;
      else if (biotype === "meso") tmb = baseTmb * 1.1;
      else tmb = baseTmb * 1.2; // ecto
    } else {
      const baseTmb = 665 + 9.6 * numWeight + 1.8 * numHeight - 4.7 * numAge;
      if (biotype === "endo") tmb = baseTmb;
      else if (biotype === "meso") tmb = baseTmb * 1.05;
      else tmb = baseTmb * 1.1; // ecto
    }
    tmb = Math.max(800, tmb);

    // 4. Gasto Energético Total (GET / TDEE)
    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      intense: 1.725,
      athlete: 1.9,
    };
    const tdee = tmb * activityMultipliers[activity];

    // 5. Planejamento de Metas de Calorias e Macronutrientes
    let targetCalories = tdee;
    let proteinPerKg = 2.0;
    let fatPerKg = 0.9;

    if (dietGoal === "cutting") {
      // Déficit para queima de gordura preservando massa magra
      targetCalories = Math.max(tmb, tdee - 450);
      proteinPerKg = 2.2; // Maior aporte de proteína para evitar catabolismo
      fatPerKg = 0.8;
    } else if (dietGoal === "maintenance") {
      targetCalories = tdee;
      proteinPerKg = 2.0;
      fatPerKg = 0.9;
    } else if (dietGoal === "bulking") {
      // Superávit moderado para ganho de massa limpa
      targetCalories = tdee + 350;
      proteinPerKg = 2.0;
      fatPerKg = 1.0;
    }

    const proteinGrams = Math.round(numWeight * proteinPerKg);
    const proteinCalories = proteinGrams * 4;

    const fatGrams = Math.round(numWeight * fatPerKg);
    const fatCalories = fatGrams * 9;

    const remainingCalories = Math.max(0, targetCalories - (proteinCalories + fatCalories));
    const carbsGrams = Math.round(remainingCalories / 4);
    const carbsCalories = carbsGrams * 4;

    const totalCalculatedCalories = proteinCalories + fatCalories + carbsCalories;

    return {
      bf: parseFloat(bf.toFixed(1)),
      fatMass: parseFloat(fatMass.toFixed(1)),
      leanMass: parseFloat(leanMass.toFixed(1)),
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      targetCalories: Math.round(totalCalculatedCalories),
      calculationMode,
      macros: {
        protein: { grams: proteinGrams, kcal: proteinCalories, perKg: proteinPerKg },
        carbs: { grams: carbsGrams, kcal: carbsCalories },
        fat: { grams: fatGrams, kcal: fatCalories, perKg: fatPerKg },
      },
    };
  }, [sex, biotype, age, height, weight, waist, neck, hip, activity, dietGoal]);

  // Salvar medição no banco de dados
  const handleSaveToHistory = async () => {
    if (!calculation) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/student/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(weight),
          bodyFat: calculation.bf,
          waist: parseFloat(waist),
          date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha ao registrar a avaliação no histórico.");
      }

      setSaveSuccess(true);
      if (onSaved) {
        onSaved();
      }
      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar medição.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-7 border border-[#E2E8F0] shadow-sm space-y-6">
      {/* Cabeçalho da Calculadora */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <Compass className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-extrabold text-[#0F172A] tracking-tight">
              Calculadora de Composição Corporal e Dieta
            </h3>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Método da Marinha dos Estados Unidos e Taxa Metabólica Basal com divisão de macronutrientes.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="self-end sm:self-auto text-xs font-bold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        )}
      </div>

      {/* Formulário de Entradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna 1: Dados Pessoais e Biotipo */}
        <div className="space-y-4">
          {/* Seletor de Sexo */}
          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Sexo Biológico
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setSex("male")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
                  sex === "male"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Masculino</span>
              </button>
              <button
                type="button"
                onClick={() => setSex("female")}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] ${
                  sex === "female"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Feminino</span>
              </button>
            </div>
          </div>

          {/* Seletor de Biotipo */}
          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Biotipo Predominante
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setBiotype("ecto")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center min-h-[44px] ${
                  biotype === "ecto"
                    ? "bg-white text-[#2563EB] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Ectomorfo</span>
                <span className="text-[9px] text-slate-400 font-normal">Metabolismo ágil</span>
              </button>
              <button
                type="button"
                onClick={() => setBiotype("meso")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center min-h-[44px] ${
                  biotype === "meso"
                    ? "bg-white text-[#2563EB] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Mesomorfo</span>
                <span className="text-[9px] text-slate-400 font-normal">Equilibrado</span>
              </button>
              <button
                type="button"
                onClick={() => setBiotype("endo")}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center min-h-[44px] ${
                  biotype === "endo"
                    ? "bg-white text-[#2563EB] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Endomorfo</span>
                <span className="text-[9px] text-slate-400 font-normal">Ganha fácil</span>
              </button>
            </div>
          </div>

          {/* Idade, Altura e Peso */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Idade
              </label>
              <input
                type="number"
                min="14"
                max="100"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-base md:text-sm text-[#0F172A] font-semibold focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
                placeholder="28"
              />
              <span className="text-[10px] text-slate-400">anos</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Altura
              </label>
              <input
                type="number"
                step="0.1"
                min="120"
                max="240"
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-base md:text-sm text-[#0F172A] font-semibold focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
                placeholder="175"
              />
              <span className="text-[10px] text-slate-400">cm</span>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Peso
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-base md:text-sm text-[#0F172A] font-semibold focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
                placeholder="76"
              />
              <span className="text-[10px] text-slate-400">kg</span>
            </div>
          </div>
        </div>

        {/* Coluna 2: Medidas de Fita e Nível de Atividade */}
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Medidas com Fita Métrica
            </label>
            <div className={`grid ${sex === "female" ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Cintura</label>
                <input
                  type="number"
                  step="0.1"
                  min="40"
                  max="180"
                  inputMode="decimal"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-base md:text-sm text-[#0F172A] font-semibold focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
                  placeholder="Ex: 84"
                />
                <span className="text-[10px] text-slate-400">altura do umbigo</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">Pescoço</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="60"
                  inputMode="decimal"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-base md:text-sm text-[#0F172A] font-semibold focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
                  placeholder="Ex: 38"
                />
                <span className="text-[10px] text-slate-400">abaixo do pomo</span>
              </div>

              {sex === "female" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-slate-500">Quadril</label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="180"
                    inputMode="decimal"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-base md:text-sm text-[#0F172A] font-semibold focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all"
                    placeholder="Ex: 98"
                  />
                  <span className="text-[10px] text-slate-400">maior diâmetro</span>
                </div>
              )}
            </div>
          </div>

          {/* Nível de Atividade Física */}
          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Nível de Atividade Diária
            </label>
            <select
              value={activity}
              onChange={(e) => setActivity(e.target.value as ActivityLevel)}
              className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 text-base md:text-sm text-[#0F172A] font-semibold focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 outline-none transition-all bg-white cursor-pointer"
            >
              <option value="sedentary">Sedentário (Trabalho sentado, pouco ou nenhum exercício)</option>
              <option value="light">Levemente ativo (Treino leve 1 a 3 dias por semana)</option>
              <option value="moderate">Moderadamente ativo (Musculação ou cardio 3 a 5 dias)</option>
              <option value="intense">Muito ativo (Treino intenso 6 a 7 dias por semana)</option>
              <option value="athlete">Atleta de elite (Treinos pesados duas vezes ao dia)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados e Gráficos da Composição Corporal */}
      {calculation ? (
        <div className="space-y-6 pt-2">
          {/* Badge do Método de Avaliação Ativo */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  calculation.calculationMode === "navy"
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-blue-500"
                }`}
              ></span>
              <span className="text-xs font-bold text-slate-800">
                {calculation.calculationMode === "navy"
                  ? "Método Oficial Gorgonoid (Fórmula Marinha dos EUA) Ativo"
                  : "Estimativa Rápida por Peso, Altura e Biotipo Ativa"}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {calculation.calculationMode === "navy"
                ? "Máxima precisão calculada com base na fita métrica."
                : "Preencha cintura e pescoço para ativar o método exato de fita do Gorgonoid."}
            </span>
          </div>

          {/* Silhueta Corporal Dinâmica (Homem para alunos homens, Mulher para alunas mulheres) */}
          <BodySilhouetteGraphic
            sex={sex}
            bf={calculation.bf}
            leanMass={calculation.leanMass}
            fatMass={calculation.fatMass}
            totalWeight={parseFloat(weight) || 76}
          />

          {/* Cartões de Indicadores Chave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                Gordura Corporal
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {calculation.bf}%
              </div>
              <span className="text-[10px] text-amber-700/80 font-medium">Método Marinha</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
                Massa Magra
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#2563EB] mt-1">
                {calculation.leanMass} <span className="text-xs font-bold text-blue-600">kg</span>
              </div>
              <span className="text-[10px] text-blue-700/80 font-medium">Músculo, osso e água</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                Massa Gorda
              </span>
              <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
                {calculation.fatMass} <span className="text-xs font-bold text-rose-500">kg</span>
              </div>
              <span className="text-[10px] text-rose-700/80 font-medium">Tecido adiposo</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Metabolismo (TMB)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                {calculation.tmb} <span className="text-xs font-bold text-emerald-500">kcal</span>
              </div>
              <span className="text-[10px] text-emerald-700/80 font-medium">
                Gasto diário: {calculation.tdee} kcal
              </span>
            </div>
          </div>

          {/* Gráfico 1: Barra Visual de Proporção de Composição Corporal */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#2563EB]" />
                Proporção da sua Composição Corporal
              </h4>
              <span className="text-xs font-bold text-slate-600 font-mono">
                Total: {weight} kg
              </span>
            </div>

            {/* Barra Segmentada de Composição */}
            <div className="space-y-1.5">
              <div className="w-full h-7 rounded-xl bg-slate-200 overflow-hidden flex shadow-inner border border-slate-200">
                <div
                  style={{ width: `${100 - calculation.bf}%` }}
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-[11px] font-extrabold transition-all duration-500 shadow-sm"
                  title={`Massa Magra: ${calculation.leanMass} kg (${(100 - calculation.bf).toFixed(1)}%)`}
                >
                  {100 - calculation.bf >= 25 && `Massa Magra ${(100 - calculation.bf).toFixed(0)}%`}
                </div>
                <div
                  style={{ width: `${calculation.bf}%` }}
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 flex items-center justify-center text-white text-[11px] font-extrabold transition-all duration-500 shadow-sm"
                  title={`Gordura: ${calculation.fatMass} kg (${calculation.bf}%)`}
                >
                  {calculation.bf >= 15 && `Gordura ${calculation.bf}%`}
                </div>
              </div>

              {/* Legenda visual da barra */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                  <span className="font-semibold text-slate-700">
                    Massa Magra: <strong className="text-blue-600">{calculation.leanMass} kg</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="font-semibold text-slate-700">
                    Gordura: <strong className="text-amber-600">{calculation.fatMass} kg</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Planejamento de Dieta e Macronutrientes */}
          <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <Apple className="w-4 h-4 text-emerald-600" />
                  Metas de Dieta e Macronutrientes
                </h4>
                <p className="text-[11px] text-[#64748B]">
                  Gasto calórico estimado: <strong>{calculation.tdee} kcal/dia</strong>. Escolha sua meta:
                </p>
              </div>

              {/* Seletor de Meta de Dieta */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDietGoal("cutting")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dietGoal === "cutting"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Emagrecimento
                </button>
                <button
                  type="button"
                  onClick={() => setDietGoal("maintenance")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dietGoal === "maintenance"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Manutenção
                </button>
                <button
                  type="button"
                  onClick={() => setDietGoal("bulking")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    dietGoal === "bulking"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Hipertrofia
                </button>
              </div>
            </div>

            {/* Cartão de Calorias Totais da Meta */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Meta Calórica Diária Recomendada:
              </span>
              <span className="text-lg font-black text-[#0F172A] font-mono">
                {calculation.targetCalories} <span className="text-xs font-semibold text-slate-500">kcal/dia</span>
              </span>
            </div>

            {/* Gráfico 2: Barra Proporcional de Macronutrientes */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  style={{
                    width: `${Math.round((calculation.macros.protein.kcal / calculation.targetCalories) * 100)}%`,
                  }}
                  className="h-full bg-blue-600 transition-all duration-300"
                  title="Proteínas"
                />
                <div
                  style={{
                    width: `${Math.round((calculation.macros.carbs.kcal / calculation.targetCalories) * 100)}%`,
                  }}
                  className="h-full bg-emerald-500 transition-all duration-300"
                  title="Carboidratos"
                />
                <div
                  style={{
                    width: `${Math.round((calculation.macros.fat.kcal / calculation.targetCalories) * 100)}%`,
                  }}
                  className="h-full bg-amber-500 transition-all duration-300"
                  title="Gorduras"
                />
              </div>

              {/* Detalhamento dos 3 Macros */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900">Proteínas</span>
                    <span className="text-[11px] font-semibold text-blue-700">
                      {calculation.macros.protein.perKg}g/kg
                    </span>
                  </div>
                  <div className="text-xl font-black text-blue-700 font-mono">
                    {calculation.macros.protein.grams}g
                  </div>
                  <div className="text-[10px] text-blue-600/80">
                    {calculation.macros.protein.kcal} kcal (
                    {Math.round((calculation.macros.protein.kcal / calculation.targetCalories) * 100)}%)
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900">Carboidratos</span>
                    <span className="text-[11px] font-semibold text-emerald-700">Energia</span>
                  </div>
                  <div className="text-xl font-black text-emerald-700 font-mono">
                    {calculation.macros.carbs.grams}g
                  </div>
                  <div className="text-[10px] text-emerald-600/80">
                    {calculation.macros.carbs.kcal} kcal (
                    {Math.round((calculation.macros.carbs.kcal / calculation.targetCalories) * 100)}%)
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">Gorduras Boas</span>
                    <span className="text-[11px] font-semibold text-amber-700">
                      {calculation.macros.fat.perKg}g/kg
                    </span>
                  </div>
                  <div className="text-xl font-black text-amber-700 font-mono">
                    {calculation.macros.fat.grams}g
                  </div>
                  <div className="text-[10px] text-amber-600/80">
                    {calculation.macros.fat.kcal} kcal (
                    {Math.round((calculation.macros.fat.kcal / calculation.targetCalories) * 100)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Ação: Salvar Medição no Histórico */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveToHistory}
              className="w-full py-3.5 px-4 min-h-[48px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/15 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando no seu histórico...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Avaliação no Meu Histórico e Gráficos</span>
                </>
              )}
            </button>

            {saveSuccess && (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-center font-semibold animate-fade-in">
                Avaliação corporal salva com sucesso! Os gráficos de evolução foram atualizados.
              </p>
            )}

            {saveError && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl text-center font-semibold animate-fade-in">
                {saveError}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-center">
          <p className="text-xs text-amber-800 font-medium">
            Preencha todos os campos obrigatórios (altura, peso, cintura e pescoço) para calcular sua composição corporal e dieta.
          </p>
        </div>
      )}
    </div>
  );
}
