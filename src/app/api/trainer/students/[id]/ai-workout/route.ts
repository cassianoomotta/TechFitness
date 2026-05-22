import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

function generateMockWorkout(dbExercises: any[], goal: string, notes: string) {
  const isPernas = goal.toLowerCase().includes("perna") || goal.toLowerCase().includes("inferior");
  
  let selectedList = [];
  if (isPernas) {
    selectedList = dbExercises.filter(e => e.muscleGroup === "Pernas" || e.muscleGroup === "Panturrilhas");
  } else {
    selectedList = dbExercises.filter(e => ["Peito", "Costas", "Ombros", "Braços"].includes(e.muscleGroup));
  }
  
  if (selectedList.length === 0) {
    selectedList = dbExercises.slice(0, 5);
  } else {
    selectedList = selectedList.sort(() => 0.5 - Math.random()).slice(0, 5);
  }
  
  const exercises = selectedList.map((e, idx) => ({
    exerciseId: e.id,
    name: e.name,
    muscleGroup: e.muscleGroup,
    equipment: e.equipment,
    sets: idx % 2 === 0 ? 4 : 3,
    reps: idx % 3 === 0 ? "8-10" : "10-12",
    restSeconds: e.muscleGroup === "Pernas" ? 90 : 60,
    method: "Normal",
    recommendedRpe: 8,
    recommendedWeight: e.equipment === "Barra" ? 20 : e.equipment === "Halteres" ? 12 : 30,
    notes: `Foco na execução controlada de ${e.name}.`
  }));
  
  return {
    name: isPernas ? "Treino A - Foco Pernas (IA)" : "Treino A - Foco Superior (IA)",
    division: "A",
    description: `Treino gerado via Copilot IA (Modo Simulação). Foco: ${goal || "Hipertrofia Geral"}. ${notes ? `Observação: ${notes}` : ""}`,
    weekDays: ["Seg", "Qua", "Sex"],
    exercises
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TRAINER") {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const { id: studentId } = await params;
    const body = await request.json();
    const { goal = "", notes = "" } = body;

    // Buscar perfil do personal trainer logado
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!trainerProfile) {
      return NextResponse.json(
        { error: "Perfil de treinador não encontrado." },
        { status: 404 }
      );
    }

    // Validar se o aluno pertence ao personal
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Aluno não encontrado." },
        { status: 404 }
      );
    }

    if (student.trainerId !== trainerProfile.id) {
      return NextResponse.json(
        { error: "Acesso negado. Este aluno não pertence a você." },
        { status: 403 }
      );
    }

    // Coletar dados físicos recentes para contexto do prompt
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 2,
    });

    const sessions = await prisma.workoutSession.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 5,
    });

    const logs = await prisma.exerciseLog.findMany({
      where: { studentId },
      include: {
        exercise: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        session: {
          date: "desc",
        },
      },
      take: 10,
    });

    const recentWeight = measurements[0]?.weight || "Não registrado";
    const recentBf = measurements[0]?.bodyFat !== null ? `${measurements[0]?.bodyFat}%` : "Não registrado";
    const progressSummary = logs.map(l => `- ${l.exercise.name}: ${l.weightUsed}kg x ${l.repsPerformed} reps`).join("\n");
    const frequency = sessions.length;

    // Buscar todos os exercícios cadastrados no banco
    const dbExercises = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        muscleGroup: true,
        equipment: true,
      }
    });

    if (dbExercises.length === 0) {
      return NextResponse.json(
        { error: "Nenhum exercício cadastrado no banco de dados. Adicione exercícios primeiro." },
        { status: 400 }
      );
    }

    const promptText = `
Você é o Copilot IA de Prescrição de Treino da TechFitness.
Crie um plano de treino personalizado para o aluno "${student.user.name}".

DADOS DO ALUNO:
- Peso: ${recentWeight}kg
- BF: ${recentBf}
- Treinos recentes: ${frequency} sessões nos logs
- Histórico de carga recente nos exercícios:
${progressSummary || "Nenhum histórico de treino disponível."}

INSTRUÇÕES DO TREINADOR:
- Objetivo principal: ${goal || "Geral (Hipertrofia/Condicionamento)"}
- Observações/Limitações: ${notes || "Nenhuma"}

Selecione de 4 a 6 exercícios adequados a partir da lista de EXERCÍCIOS DISPONÍVEIS abaixo.
Para cada exercício sugerido, você DEVE selecionar um correspondente na lista e retornar o "exerciseId", "name", "muscleGroup" e "equipment" exatos.

EXERCÍCIOS DISPONÍVEIS (Use APENAS os exercícios desta lista, respeitando os IDs e Nomes exatos):
${dbExercises.map(e => `- ID: "${e.id}", Nome: "${e.name}", Grupo: "${e.muscleGroup}", Equipamento: "${e.equipment}"`).join("\n")}

Você DEVE retornar a resposta EXCLUSIVAMENTE em formato JSON (sem markdown de volta, apenas o JSON bruto estruturado) com a seguinte estrutura de propriedades e tipos exatos:
{
  "name": "Nome do Treino (ex: Treino A - Foco Peito & Tríceps)",
  "division": "Divisão do Treino (ex: A, B ou C)",
  "description": "Uma breve descrição justificando as escolhas de exercícios e cargas para este aluno",
  "weekDays": ["Seg", "Qua", "Sex"],
  "exercises": [
    {
      "exerciseId": "ID_DO_EXERCICIO_DA_LISTA",
      "name": "NOME_DO_EXERCICIO_DA_LISTA",
      "muscleGroup": "GRUPO_MUSCULAR_DA_LISTA",
      "equipment": "EQUIPAMENTO_DA_LISTA",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "method": "Normal",
      "recommendedRpe": 8,
      "recommendedWeight": 15,
      "notes": "Uma observação rápida de execução"
    }
  ]
}
`;

    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    let workoutPlan = null;
    let providerUsed = "";
    let apiErrors: string[] = [];

    // 1. Tentar Gemini primeiro
    if (geminiKey && geminiKey !== "SUA_CHAVE_AQUI" && geminiKey !== "") {
      try {
        console.log("Tentando gerar treino com Gemini...");
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: promptText }],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            workoutPlan = JSON.parse(cleanJsonString(text));
            providerUsed = "gemini";
          }
        } else {
          const errText = await response.text();
          apiErrors.push(`Gemini error (${response.status}): ${errText}`);
        }
      } catch (err: any) {
        console.error("Erro na API do Gemini:", err);
        apiErrors.push(`Gemini exception: ${err.message || err}`);
      }
    }

    // 2. Tentar OpenAI se Gemini falhou ou não tem chave
    if (!workoutPlan && openAiKey && openAiKey !== "SUA_CHAVE_AQUI" && openAiKey !== "") {
      try {
        console.log("Tentando gerar treino com OpenAI...");
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: promptText,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            workoutPlan = JSON.parse(cleanJsonString(text));
            providerUsed = "openai";
          }
        } else {
          const errText = await response.text();
          apiErrors.push(`OpenAI error (${response.status}): ${errText}`);
        }
      } catch (err: any) {
        console.error("Erro na API do OpenAI:", err);
        apiErrors.push(`OpenAI exception: ${err.message || err}`);
      }
    }

    // 3. Fallback para Mock se ambos falharam/não configurados
    if (!workoutPlan) {
      console.warn("Nenhum modelo de IA disponível ou ambos falharam. Caindo no gerador de treino simulado.", apiErrors);
      workoutPlan = generateMockWorkout(dbExercises, goal, notes);
      providerUsed = "mock";
    }

    return NextResponse.json({
      success: true,
      provider: providerUsed,
      workoutPlan,
    });
  } catch (error: any) {
    console.error("ERRO NO GERADOR DE TREINOS IA:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar a criação de treino por IA." },
      { status: 500 }
    );
  }
}
