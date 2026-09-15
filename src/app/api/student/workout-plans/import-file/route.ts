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

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Acesso restrito. Faça login como aluno para importar treinos." },
        { status: 401 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave da API do Gemini não configurada no servidor." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado. Envie uma foto ou PDF do seu treino." },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 12MB)
    if (file.size > 12 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. O limite máximo é de 12MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const promptText = `Você é um treinador de musculação de elite e especialista em leitura e digitalização de fichas de academia.
Analise a foto ou documento PDF fornecido e extraia com precisão todos os treinos e exercícios presentes.

Orientações cruciais:
1. "name": Nome do treino/ficha (ex: "Treino A - Peito e Tríceps", "Treino Inferiores", etc.). Se não houver explícito, deduza pelos grupos musculares.
2. "division": A letra ou identificador da divisão (ex: "A", "B", "C", "D", "Superior", "Inferior").
3. "weekDays": Dias sugeridos (ex: ["Seg", "Qua", "Sex"]) caso apareça na ficha. Se não constar, retorne array vazio [].
4. Para cada exercício:
   - "name": Nome completo em português claro (resolva abreviações de instrutor, ex: "Sup. Reto" -> "Supino reto com barra", "Pux. Alta" -> "Pulley frontal com triângulo", "Elev. Lat." -> "Elevação lateral com halteres", "Leg 45" -> "Leg press 45", "Extensora" -> "Cadeira extensora", "Flexora" -> "Cadeira flexora").
   - "sets": Número inteiro de séries (padrão 4 se omitido).
   - "reps": Repetições em texto (ex: "10-12", "8 a 10", "Até a falha", etc. Padrão "10-12").
   - "restSeconds": Descanso em segundos (inteiro, padrão 60).
   - "method": Técnica (ex: "Normal", "Drop Set", "Rest Pause", "Bi-Set", etc. Padrão "Normal").
   - "notes": Observações de pegada ou execução caso existam.

Retorne EXCLUSIVAMENTE um objeto JSON válido no formato:
{
  "name": "Treino A - Peito e Tríceps",
  "division": "A",
  "description": "Ficha importada via IA",
  "weekDays": ["Seg", "Qua"],
  "exercises": [
    {
      "name": "Supino reto com barra",
      "sets": 4,
      "reps": "10-12",
      "restSeconds": 60,
      "method": "Normal",
      "notes": ""
    }
  ]
}`;

    // Chamar Gemini 3.6 Flash com inlineData
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Erro na resposta do Gemini:", geminiResponse.status, errText);
      return NextResponse.json(
        { error: "A IA não conseguiu interpretar o documento. Certifique-se de que a imagem esteja nítida." },
        { status: 502 }
      );
    }

    const geminiResult = await geminiResponse.json();
    const rawContent = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      return NextResponse.json(
        { error: "Nenhum dado legível foi extraído da imagem fornecida." },
        { status: 422 }
      );
    }

    let parsedPlan: GeminiExtractionResponse;
    try {
      parsedPlan = JSON.parse(rawContent);
    } catch (e) {
      console.error("Falha ao fazer parse do JSON do Gemini:", rawContent);
      return NextResponse.json(
        { error: "Falha na formatação dos dados pela IA. Tente novamente com outra foto." },
        { status: 500 }
      );
    }

    // Carregar exercícios da biblioteca do sistema para cruzamento
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

    // Mapear e cruzar com os exercícios oficiais
    const mappedExercises = (parsedPlan.exercises || []).map((ext, idx) => {
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

      // Considerar match válido se similaridade >= 40%
      const matched = highestRating >= 0.40 ? bestMatch : null;

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
        sets: Number(ext.sets) || 4,
        reps: String(ext.reps || "10-12"),
        restSeconds: Number(ext.restSeconds) || 60,
        method: ext.method || "Normal",
        notes: ext.notes || "",
      };
    });

    return NextResponse.json({
      success: true,
      plan: {
        name: parsedPlan.name || "Treino Importado com IA",
        division: parsedPlan.division || "A",
        description: parsedPlan.description || "Ficha digitalizada automaticamente via IA",
        weekDays: parsedPlan.weekDays || [],
        exercises: mappedExercises,
      },
    });
  } catch (error: unknown) {
    console.error("Erro interno ao importar treino:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao processar seu arquivo." },
      { status: 500 }
    );
  }
}
