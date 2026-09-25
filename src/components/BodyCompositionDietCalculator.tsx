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
  Lock,
  AlertCircle,
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
  // Entradas do formulário — Iniciam vazias para evitar cálculos com dados fictícios
  const [sex, setSex] = useState<SexType>("male");
  const [biotype, setBiotype] = useState<BiotypeType>("meso");
  const [age, setAge] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>(initialWeight ? String(initialWeight) : "");
  const [waist, setWaist] = useState<string>("");
  const [neck, setNeck] = useState<string>("");
  const [hip, setHip] = useState<string>(""); // Obrigatório para mulheres
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [dietGoal, setDietGoal] = useState<DietGoal>("cutting");

  // Controle de validação e bloqueio de cálculo
  const [hasCalculated, setHasCalculated] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Estado de salvamento no banco de dados
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Validação estrita de campos fundamentais (apenas Idade, Altura e Peso são obrigatórios)
  const missingFields = useMemo(() => {
    const list: { field: string; label: string }[] = [];
    if (!age.trim() || parseFloat(age) <= 0) list.push({ field: "age", label: "Idade" });
    if (!height.trim() || parseFloat(height) <= 0) list.push({ field: "height", label: "Altura" });
    if (!weight.trim() || parseFloat(weight) <= 0) list.push({ field: "weight", label: "Peso" });
    return list;
  }, [age, height, weight]);

  const isFormValid = missingFields.length === 0;

  // Executar validação e autorizar cálculo
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAttemptedSubmit(true);
    if (!isFormValid) {
      setHasCalculated(false);
      return;
    }
    setHasCalculated(true);
  };

  // Cálculos oficiais da Fórmula da Marinha dos EUA (bloqueado se faltar campo obrigatório)
  const calculation = useMemo(() => {
    if (!hasCalculated || !isFormValid) {
      return null;
    }

    const numAge = parseFloat(age) || 0;
    const numHeight = parseFloat(height) || 0;
    const numWeight = parseFloat(weight) || 0;
    const numWaist = parseFloat(waist) || 0;
    const numNeck = parseFloat(neck) || 0;
    const numHip = parseFloat(hip) || 0;

    // Se o aluno preencher as medidas com fita métrica, o cálculo de % BF fica muito mais assertivo
    const hasTapeMeasurements =
      numWaist > 0 &&
      numNeck > 0 &&
      (sex === "male" || numHip > 0);

    let bf = 0;

    // 1. Cálculo de Percentual de Gordura (% BF)
    if (hasTapeMeasurements) {
      // Fórmula da Marinha dos EUA (alta precisão)
      if (sex === "male") {
        const waistMinusNeck = numWaist - numNeck;
        if (waistMinusNeck > 0) {
          const logDiff = Math.log10(waistMinusNeck);
          const logHeight = Math.log10(numHeight);
          bf = 495 / (1.0324 - 0.19077 * logDiff + 0.15456 * logHeight) - 450 + 2;
        }
      } else {
        const circSum = numWaist + numHip - numNeck;
        if (circSum > 0) {
          const logCirc = Math.log10(circSum);
          const logHeight = Math.log10(numHeight);
          bf = 495 / (1.29579 - 0.35004 * logCirc + 0.221 * logHeight) - 450;
        }
      }
    }

    // Se não tiver medidas de fita ou se o cálculo logarítmico for inválido, usa estimativa biométrica (Fórmula Deurenberg)
    if (bf <= 0) {
      const heightM = numHeight / 100;
      const bmi = heightM > 0 ? numWeight / (heightM * heightM) : 22;
      bf = 1.20 * bmi + 0.23 * numAge - (sex === "male" ? 16.2 : 5.4);
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
      targetCalories = Math.max(tmb, tdee - 450);
      proteinPerKg = 2.2;
      fatPerKg = 0.8;
    } else if (dietGoal === "maintenance") {
      targetCalories = tdee;
      proteinPerKg = 2.0;
      fatPerKg = 0.9;
    } else if (dietGoal === "bulking") {
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
      isExactNavy: hasTapeMeasurements,
      macros: {
        protein: { grams: proteinGrams, kcal: proteinCalories, perKg: proteinPerKg },
        carbs: { grams: carbsGrams, kcal: carbsCalories },
        fat: { grams: fatGrams, kcal: fatCalories, perKg: fatPerKg },
      },
    };
  }, [hasCalculated, isFormValid, age, height, weight, waist, neck, hip, sex, biotype, activity, dietGoal]);

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
          waist: waist && parseFloat(waist) > 0 ? parseFloat(waist) : null,
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
            Calcule sua taxa metabólica, calorias e macros. Inserindo suas medidas com fita métrica, o cálculo de gordura corporal fica ainda mais assertivo.
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

      {/* Formulário de Entradas com Validação Visual */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna 1: Dados Pessoais e Biotipo */}
        <div className="space-y-4">
          {/* Seletor de Sexo */}
          <div>
            <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Sexo Biológico <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSex("male");
                  setHasCalculated(false);
                }}
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
                onClick={() => {
                  setSex("female");
                  setHasCalculated(false);
                }}
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
              Biotipo Predominante <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setBiotype("ecto");
                  setHasCalculated(false);
                }}
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
                onClick={() => {
                  setBiotype("meso");
                  setHasCalculated(false);
                }}
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
                onClick={() => {
                  setBiotype("endo");
                  setHasCalculated(false);
                }}
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
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Idade <span className="text-rose-500">*</span>
                </label>
              </div>
              <input
                type="number"
                min="14"
                max="100"
                inputMode="numeric"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setHasCalculated(false);
                }}
                className={`w-full px-3 py-2.5 min-h-[48px] rounded-xl border text-base md:text-sm text-[#0F172A] font-semibold outline-none transition-all ${
                  attemptedSubmit && (!age || parseFloat(age) <= 0)
                    ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 ring-2 ring-rose-200"
                    : "border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                }`}
                placeholder="Ex: 28"
              />
              {attemptedSubmit && (!age || parseFloat(age) <= 0) ? (
                <span className="text-[10px] text-rose-500 font-bold block">Obrigatório</span>
              ) : (
                <span className="text-[10px] text-slate-400 block">anos</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Altura <span className="text-rose-500">*</span>
                </label>
              </div>
              <input
                type="number"
                step="0.1"
                min="120"
                max="240"
                inputMode="decimal"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  setHasCalculated(false);
                }}
                className={`w-full px-3 py-2.5 min-h-[48px] rounded-xl border text-base md:text-sm text-[#0F172A] font-semibold outline-none transition-all ${
                  attemptedSubmit && (!height || parseFloat(height) <= 0)
                    ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 ring-2 ring-rose-200"
                    : "border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                }`}
                placeholder="Ex: 175"
              />
              {attemptedSubmit && (!height || parseFloat(height) <= 0) ? (
                <span className="text-[10px] text-rose-500 font-bold block">Obrigatório</span>
              ) : (
                <span className="text-[10px] text-slate-400 block">cm</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Peso <span className="text-rose-500">*</span>
                </label>
              </div>
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                inputMode="decimal"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setHasCalculated(false);
                }}
                className={`w-full px-3 py-2.5 min-h-[48px] rounded-xl border text-base md:text-sm text-[#0F172A] font-semibold outline-none transition-all ${
                  attemptedSubmit && (!weight || parseFloat(weight) <= 0)
                    ? "border-rose-400 bg-rose-50/20 focus:border-rose-500 ring-2 ring-rose-200"
                    : "border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                }`}
                placeholder="Ex: 75.5"
              />
              {attemptedSubmit && (!weight || parseFloat(weight) <= 0) ? (
                <span className="text-[10px] text-rose-500 font-bold block">Obrigatório</span>
              ) : (
                <span className="text-[10px] text-slate-400 block">kg</span>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 2: Medidas de Fita Métrica (Opcionais para maior assertividade) */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Medidas com Fita Métrica
              </label>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                Opcional • Torna o cálculo mais assertivo
              </span>
            </div>

            <div className={`grid ${sex === "female" ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
              {/* Cintura */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                  <span>Cintura</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="40"
                  max="180"
                  inputMode="decimal"
                  value={waist}
                  onChange={(e) => {
                    setWaist(e.target.value);
                    setHasCalculated(false);
                  }}
                  className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-base md:text-sm text-[#0F172A] font-semibold outline-none transition-all"
                  placeholder="Ex: 84"
                />
                <span className="text-[10px] text-slate-400 block">altura do umbigo</span>
              </div>

              {/* Pescoço */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                  <span>Pescoço</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="60"
                  inputMode="decimal"
                  value={neck}
                  onChange={(e) => {
                    setNeck(e.target.value);
                    setHasCalculated(false);
                  }}
                  className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-base md:text-sm text-[#0F172A] font-semibold outline-none transition-all"
                  placeholder="Ex: 38"
                />
                <span className="text-[10px] text-slate-400 block">abaixo do pomo</span>
              </div>

              {/* Quadril (apenas feminino) */}
              {sex === "female" && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                    <span>Quadril</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="50"
                    max="180"
                    inputMode="decimal"
                    value={hip}
                    onChange={(e) => {
                      setHip(e.target.value);
                      setHasCalculated(false);
                    }}
                    className="w-full px-3 py-2.5 min-h-[48px] rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-base md:text-sm text-[#0F172A] font-semibold outline-none transition-all"
                    placeholder="Ex: 98"
                  />
                  <span className="text-[10px] text-slate-400 block">maior diâmetro</span>
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
              <option value="athlete">Atleta (Treinos pesados duas vezes ao dia)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botão de Ação Primária: Calcular Avaliação Corporal */}
      <div>
        <button
          type="button"
          onClick={handleCalculate}
          className="w-full py-3.5 px-4 min-h-[48px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white text-sm font-extrabold transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" />
          <span>Calcular Avaliação Corporal e Dieta</span>
        </button>
      </div>

      {/* Estado Bloqueado: Exibir orientações e campos pendentes */}
      {!calculation && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2.5 text-[#0F172A]">
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Preencha seus dados para calcular
              </h4>
              <p className="text-[11px] text-[#64748B]">
                Informe sua Idade, Altura e Peso para calcular. Adicionar a cintura e o pescoço com fita métrica deixará o cálculo de gordura corporal e calorias ainda mais assertivo!
              </p>
            </div>
          </div>

          {attemptedSubmit && missingFields.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200/80 space-y-2 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <AlertCircle className="w-4 h-4" />
                <span>Preencha os campos obrigatórios para liberar o cálculo:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingFields.map((f) => (
                  <span
                    key={f.field}
                    className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold"
                  >
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resultados e Gráficos da Composição Corporal (Desbloqueado após cálculo válido) */}
      {calculation && (
        <div className="space-y-6 pt-2 animate-fade-in">
          {/* Badge do Método de Avaliação Ativo */}
          {calculation.isExactNavy ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-900">
                  Cálculo de Alta Precisão (Fórmula da Marinha dos EUA com Fita Métrica)
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                Avaliação de máxima assertividade com base nas suas circunferências corporais reais.
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-xs font-bold text-blue-900">
                  Cálculo Estimado com Sucesso!
                </span>
              </div>
              <span className="text-[11px] text-blue-700 font-medium">
                Inserindo cintura e pescoço com fita métrica, o cálculo de gordura e calorias fica ainda mais assertivo!
              </span>
            </div>
          )}

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
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
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

              {/* Seletor de Meta de Dieta (responsivo, nunca sai para fora da moldura) */}
              <div className="grid grid-cols-3 w-full sm:w-auto bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                <button
                  type="button"
                  onClick={() => setDietGoal("cutting")}
                  className={`px-1.5 sm:px-3 py-2 sm:py-1.5 text-center rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
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
                  className={`px-1.5 sm:px-3 py-2 sm:py-1.5 text-center rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
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
                  className={`px-1.5 sm:px-3 py-2 sm:py-1.5 text-center rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
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
      )}
    </div>
  );
}
