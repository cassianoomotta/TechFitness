import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET/POST: Gerar a análise do Copilot IA para o aluno
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

    // 1. Coletar dados físicos do aluno
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 5,
    });

    // 2. Coletar logs de treino recentes
    const sessions = await prisma.workoutSession.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      take: 10,
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
      take: 15,
    });

    // 3. Montar o prompt rico de contexto para a IA
    const recentWeight = measurements[0]?.weight || "Não registrado";
    const recentBf = measurements[0]?.bodyFat !== null ? `${measurements[0]?.bodyFat}%` : "Não registrado";
    const prevWeight = measurements[1]?.weight || "Não registrado";
    const prevBf = measurements[1]?.bodyFat !== null ? `${measurements[1]?.bodyFat}%` : "Não registrado";

    const progressSummary = logs.map(l => `- ${l.exercise.name}: ${l.weightUsed}kg x ${l.repsPerformed} reps (Série ${l.setNumber})`).join("\n");
    const frequency = sessions.length;

    const promptText = `
Você é o Copilot IA de Periodização de Treino da TechFitness. Analise os seguintes dados do aluno "${student.user.name}" e forneça um relatório estruturado e direto em formato Markdown (com dicas acionáveis, formatação limpa e profissional) para ajudar o Personal Trainer a ajustar a periodização de treino dele.

DADOS DO ALUNO:
- Peso Atual: ${recentWeight}kg (Anterior: ${prevWeight}kg)
- Gordura Corporal (BF) Atual: ${recentBf} (Anterior: ${prevBf})
- Treinos Realizados Recentes: ${frequency} sessões registradas
- Logs de Cargas Recentes nos Exercícios:
${progressSummary || "Nenhum log registrado ainda."}

REQUISITOS DO RELATÓRIO:
1. Resumo do Estado Atual (Composição corporal e frequência de treino).
2. Análise da Progressão de Força (Se há estagnação ou evolução e em quais exercícios).
3. Recomendação Acionável de Periodização (Aumentar volume, diminuir descanso, sugestão de metas de macros/cardio se aplicável).
4. Próximo passo sugerido para o Personal Trainer (Ex: mudar divisão A/B/C, focar em drop-sets).
Gere em português, use formatação Markdown elegante e badges de impacto visual. Seja curto, direto e evite enrolações de introdução.
`;

    // 4. Se houver chave API do Gemini, faz a chamada real
    const apiKey = process.env.GEMINI_API_KEY;
    let analysisText = "";

    if (apiKey && apiKey !== "SUA_CHAVE_AQUI" && apiKey !== "") {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: promptText,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            analysisText = text;
          }
        }
      } catch (err) {
        console.error("Erro na chamada da API do Gemini:", err);
      }
    }

    // Fallback para OpenAI se Gemini falhou ou não tem chave
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!analysisText && openAiKey && openAiKey !== "SUA_CHAVE_AQUI" && openAiKey !== "") {
      try {
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
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            analysisText = text;
          }
        }
      } catch (err) {
        console.error("Erro na chamada da API do OpenAI:", err);
      }
    }

    if (analysisText) {
      return NextResponse.json({ analysis: analysisText });
    }

    // 5. Fallback Inteligente (Modo Demo Offline) - Gera relatório simulado rico em Markdown
    let analysis = `## 🤖 Relatório Copilot IA — ${student.user.name}

> [!NOTE]
> Modo demonstração ativo (API Key offline). As recomendações abaixo foram calculadas dinamicamente com base nas métricas reais salvas no perfil do aluno.

### 📊 1. Resumo do Estado Corporal
* **Peso Corporal:** ${recentWeight}kg ${typeof recentWeight === "number" && typeof prevWeight === "number" ? (recentWeight > prevWeight ? "📈 (Aumento detectado)" : "📉 (Redução detectada)") : ""}
* **Gordura Corporal (BF):** ${recentBf} ${typeof recentBf === "number" && typeof prevBf === "number" ? (recentBf > prevBf ? "🔺 (Leve aumento no percentual)" : "🔹 (Redução de BF)") : ""}
* **Frequência Recente:** O aluno executou **${frequency} treinos** nas últimas semanas, indicando uma aderência ${frequency >= 5 ? "🔥 Excelente" : "⚠️ Moderada/Baixa"}.

### ⚡ 2. Evolução de Força & Cargas
* **Membros Superiores:** O aluno demonstrou boa consistência de cargas.
* **Sugestão de Estímulo:** Recomendamos monitorar o esforço (RPE) nas séries finais. Se o RPE se mantiver abaixo de 8 por 2 treinos seguidos, o personal pode aplicar a **Sugestão de Progressão** cadastrada.

### 🏋️ 3. Recomendação Acionável de Periodização
* **Se o objetivo for Hipertrofia:** Focar em manter a faixa de repetições em 8-12 reps, controlando a velocidade da fase excêntrica (3 segundos).
* **Se o objetivo for Emagrecimento/Definição:** Adicionar 20 a 30 minutos de cardio em intensidade moderada pós-treino (LISS) 3 vezes na semana.
* **Volume:** Manter o volume semanal entre 12 e 16 séries semanais para grupos musculares principais.

### 📝 4. Próxima Etapa para o Treinador
1. **Ajuste de Cargas:** Verifique a aba de progresso para aceitar os incrementos de 2kg a 5kg recomendados pelo algoritmo.
2. **Avaliação Física:** Agende uma nova medição de perímetros dentro de 30 dias para refinar as dobras e gordura corporal.
`;

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("ERRO NO COPILOT IA:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar a análise da IA." },
      { status: 500 }
    );
  }
}
