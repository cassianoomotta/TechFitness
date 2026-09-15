import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stringSimilarity } from "string-similarity-js";

interface ExtractedExercise {
  name: string;
  sets?: number;
  reps?: string;
  restSeconds?: number;
  method?: string;
  notes?: string;
}

interface GeminiExtractionResponse {
  name: string;
  division: string;
  description?: string;
  weekDays?: string[];
  exercises: ExtractedExercise[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "STUDENT" && session.user.role !== "TRAINER")) {
      return NextResponse.json(
        { error: "Acesso restrito. Faça login para importar treinos." },
        { status: 401 }
      );
    }

    const rawGeminiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GEMINI_KEY;
    const geminiKey = rawGeminiKey ? rawGeminiKey.replace(/^["']|["']$/g, "").trim() : "";
    const rawOpenAiKey = process.env.OPENAI_API_KEY;
    const openAiKey = rawOpenAiKey ? rawOpenAiKey.replace(/^["']|["']$/g, "").trim() : "";

    if (!geminiKey && !openAiKey) {
      console.error(
        "[TechFitness AI] Nenhuma chave de IA (GEMINI_API_KEY ou OPENAI_API_KEY) encontrada nas variáveis de ambiente."
      );
      return NextResponse.json(
        { error: "O serviço de inteligência artificial está temporariamente indisponível. Tente novamente em instantes." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawText = formData.get("text") as string | null;

    if (!file && (!rawText || !rawText.trim())) {
      return NextResponse.json(
        { error: "Nenhum arquivo ou texto enviado. Envie uma foto/PDF ou cole a mensagem do seu treino." },
        { status: 400 }
      );
    }

    const promptText = `Você é um treinador de musculação de elite e especialista em leitura e estruturação de fichas de academia.
Analise o conteúdo fornecido (seja imagem, PDF ou texto colado). O conteúdo pode conter UM ÚNICO TREINO ou MÚLTIPLOS TREINOS (ex: Treino 1, Treino 2, Treino 3... ou Treino A, B, C, D, E).

Identifique e extraia TODOS os treinos encontrados.
Para cada treino:
- "name": Nome do treino (ex: "Treino 1 - Costa e Peito", "Treino 2 - Perna Completo", "Treino A - Peito e Tríceps", etc.).
- "division": A letra da divisão ("A", "B", "C", "D", "E"... onde Treino 1 é A, Treino 2 é B, etc.).
- "description": "Ficha importada via IA"
- "weekDays": Dias da semana sugeridos (array vazio [] se não especificado).
- "exercises": Lista de TODOS os exercícios deste respectivo treino.
  Para cada exercício:
  - "name": Nome completo em português claro (resolva abreviações: "Abs supra" -> "Abdominal supra", "Pux. alta" -> "Puxada alta", "Leg 45" -> "Leg press 45", "Extensora" -> "Cadeira extensora", etc.).
  - "sets": Número inteiro de séries (ex: 4).
  - "reps": Faixa de repetições em texto (ex: "12", "12-10-10-8", "20", etc. Padrão "10-12").
  - "restSeconds": Descanso em segundos (inteiro, padrão 60).
  - "method": Técnica ("Normal", "Drop Set", etc.).
  - "notes": Observações caso existam.

Retorne EXCLUSIVAMENTE um objeto JSON válido no formato:
{
  "plans": [
    {
      "name": "Treino 1 - Costa e Peito",
      "division": "A",
      "description": "Ficha importada via IA",
      "weekDays": [],
      "exercises": [
        {
          "name": "Puxada alta na barra",
          "sets": 4,
          "reps": "12",
          "restSeconds": 60,
          "method": "Normal",
          "notes": ""
        }
      ]
    }
  ]
}`;

    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    let fileBase64 = "";
    let fileMimeType = "image/jpeg";

    if (rawText && rawText.trim()) {
      parts.push({
        text: `${promptText}\n\nTEXTO DO TREINO PARA EXTRAÇÃO:\n"""\n${rawText.trim()}\n"""`,
      });
    } else if (file) {
      if (file.size > 12 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Arquivo muito grande. O limite máximo é de 12MB." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      fileBase64 = Buffer.from(bytes).toString("base64");
      fileMimeType = file.type || "image/jpeg";

      parts.push({ text: promptText });
      parts.push({
        inlineData: {
          mimeType: fileMimeType,
          data: fileBase64,
        },
      });
    }

    let rawContent = "";

    // 1. Pool de modelos Gemini em ordem de prioridade (com fallback instantâneo se houver 503)
    const GEMINI_MODELS = [
      "gemini-flash-lite-latest",
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-3.7-flash",
    ];

    if (geminiKey) {
      for (const modelName of GEMINI_MODELS) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;
          const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts,
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
              },
            }),
          });

          if (geminiResponse.ok) {
            const geminiResult = await geminiResponse.json();
            const text = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim()) {
              rawContent = text.trim();
              break; // Modelo respondeu com sucesso!
            }
          } else {
            const errText = await geminiResponse.text();
            console.warn(`[TechFitness AI] Modelo ${modelName} retornou status ${geminiResponse.status}: ${errText.slice(0, 150)}`);
          }
        } catch (err) {
          console.error(`[TechFitness AI] Exceção na chamada do modelo ${modelName}:`, err);
        }
      }
    }

    // 2. Fallback para OpenAI se todos os modelos Gemini falharem ou não tiver chave
    if (!rawContent && openAiKey) {
      try {
        type OpenAiContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };
        const contentParts: OpenAiContentPart[] = [];

        if (rawText && rawText.trim()) {
          contentParts.push({
            type: "text",
            text: `${promptText}\n\nTEXTO DO TREINO PARA EXTRAÇÃO:\n"""\n${rawText.trim()}\n"""`,
          });
        } else if (fileBase64) {
          contentParts.push({ type: "text", text: promptText });
          contentParts.push({
            type: "image_url",
            image_url: {
              url: `data:${fileMimeType};base64,${fileBase64}`,
            },
          });
        }

        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: contentParts }],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        });

        if (openAiResponse.ok) {
          const openAiResult = await openAiResponse.json();
          rawContent = openAiResult.choices?.[0]?.message?.content || "";
        } else {
          const errText = await openAiResponse.text();
          console.error("Erro na resposta da OpenAI:", openAiResponse.status, errText);
        }
      } catch (err) {
        console.error("Exceção na chamada da OpenAI:", err);
      }
    }

    if (!rawContent) {
      return NextResponse.json(
        { error: "A IA não conseguiu interpretar o documento. Verifique a nitidez da imagem ou tente colar o treino em texto." },
        { status: 502 }
      );
    }

    // Limpeza de blocos de código Markdown caso presentes
    let cleanJson = rawContent.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    cleanJson = cleanJson.trim();

    let rawObj: Record<string, unknown> = {};
    try {
      rawObj = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Falha ao fazer parse do JSON da IA:", rawContent);
      return NextResponse.json(
        { error: "A IA não conseguiu estruturar os dados. Tente novamente com outra foto ou formato de texto." },
        { status: 500 }
      );
    }

    // Carregar exercícios da biblioteca do sistema para cruzamento uma única vez
    const allDbExercises = await prisma.exercise.findMany({
      select: {
        id: true,
        name: true,
        muscleGroup: true,
        equipment: true,
        gifUrl: true,
        videoUrl: true,
      },
    });

    // Identificar se a IA retornou múltiplos treinos ou um único
    let rawPlansList: Record<string, unknown>[] = [];

    if (Array.isArray(rawObj.plans) && rawObj.plans.length > 0) {
      rawPlansList = rawObj.plans as Record<string, unknown>[];
    } else if (Array.isArray(rawObj.treinos) && rawObj.treinos.length > 0) {
      rawPlansList = rawObj.treinos as Record<string, unknown>[];
    } else if (Array.isArray(rawObj.fichas) && rawObj.fichas.length > 0) {
      rawPlansList = rawObj.fichas as Record<string, unknown>[];
    } else if (Array.isArray(rawObj) && rawObj.length > 0) {
      rawPlansList = rawObj as Record<string, unknown>[];
    } else {
      rawPlansList = [rawObj];
    }

    const mappedPlans = [];

    for (let pIdx = 0; pIdx < rawPlansList.length; pIdx++) {
      const planItem = rawPlansList[pIdx];
      if (!planItem || typeof planItem !== "object") continue;

      const fallbackDivision = String.fromCharCode(65 + (pIdx % 26)); // A, B, C, D...
      const planName = String(
        planItem.name ||
        planItem.nome ||
        planItem.titulo ||
        (planItem.treino as Record<string, unknown>)?.nome ||
        `Treino ${fallbackDivision}`
      );

      const planDivision = String(
        planItem.division ||
        planItem.divisao ||
        planItem.letra ||
        fallbackDivision
      ).toUpperCase();

      const planDescription = String(
        planItem.description ||
        planItem.descricao ||
        "Ficha digitalizada via IA"
      );

      const rawDays = planItem.weekDays || planItem.dias || planItem.diasSemana;
      const planWeekDays: string[] = Array.isArray(rawDays) ? rawDays.map(String) : [];

      // Localizar exercícios do treino
      let rawExercises: unknown[] = [];
      if (Array.isArray(planItem.exercises)) {
        rawExercises = planItem.exercises;
      } else if (Array.isArray(planItem.exercicios)) {
        rawExercises = planItem.exercicios;
      } else if (Array.isArray(planItem.itens)) {
        rawExercises = planItem.itens;
      } else if (Array.isArray(planItem.items)) {
        rawExercises = planItem.items;
      }

      const cleanExercises: Array<{
        name: string;
        sets: number;
        reps: string;
        restSeconds: number;
        method: string;
        notes: string;
      }> = [];

      for (const rawEx of rawExercises) {
        if (!rawEx || typeof rawEx !== "object") continue;
        const it = rawEx as Record<string, unknown>;

        const name = String(it.name || it.nome || it.exercicio || it.exercise || "").trim();
        if (!name) continue;

        const sets = Number(it.sets || it.series || it.set) || 4;
        const reps = String(it.reps || it.repeticoes || it.rep || "10-12");
        const restSeconds = Number(it.restSeconds || it.descanso || it.rest || it.tempo_descanso) || 60;
        const method = String(it.method || it.metodo || it.tecnica || "Normal");
        const notes = String(it.notes || it.observacoes || it.obs || "");

        cleanExercises.push({ name, sets, reps, restSeconds, method, notes });
      }

      if (cleanExercises.length === 0) continue;

      // Cruzamento dos exercícios da ficha com a base oficial
      const mappedExercises = cleanExercises.map((ext, idx) => {
        const cleanExt = ext.name.toLowerCase().trim();

        let bestMatch: (typeof allDbExercises)[0] | null = null;
        let highestRating = 0;

        for (const dbEx of allDbExercises) {
          const cleanDb = dbEx.name.toLowerCase().trim();

          if (cleanExt === cleanDb) {
            bestMatch = dbEx;
            highestRating = 1.0;
            break;
          }

          const score = stringSimilarity(cleanExt, cleanDb);
          if (score > highestRating) {
            highestRating = score;
            bestMatch = dbEx;
          }
        }

        const matched = highestRating >= 0.35 ? bestMatch : null;

        return {
          order: idx,
          extractedName: ext.name,
          exerciseId: matched ? matched.id : null,
          name: matched ? matched.name : ext.name,
          customName: matched ? ext.name : null,
          muscleGroup: matched ? matched.muscleGroup : "Geral",
          equipment: matched ? matched.equipment : "Livre",
          gifUrl: matched ? matched.gifUrl : null,
          videoUrl: matched ? matched.videoUrl : null,
          confidence: Number(highestRating.toFixed(2)),
          sets: ext.sets,
          reps: ext.reps,
          restSeconds: ext.restSeconds,
          method: ext.method,
          notes: ext.notes,
        };
      });

      mappedPlans.push({
        name: planName,
        division: planDivision,
        description: planDescription,
        weekDays: planWeekDays,
        exercises: mappedExercises,
      });
    }

    if (mappedPlans.length === 0) {
      return NextResponse.json(
        { error: "Nenhum exercício legível foi identificado na ficha. Certifique-se de que a imagem ou texto contenha a lista de exercícios." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      plans: mappedPlans,
      plan: mappedPlans[0], // Retrocompatibilidade caso o chamador espere um plano único
    });
  } catch (error: unknown) {
    console.error("Erro interno ao importar treino:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar seu arquivo." },
      { status: 500 }
    );
  }
}
