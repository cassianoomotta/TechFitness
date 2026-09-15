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
Analise o conteúdo fornecido (seja uma imagem, PDF ou texto digitado/colado) e extraia com precisão todos os treinos e exercícios presentes.

Orientações cruciais:
1. "name": Nome do treino/ficha (ex: "Treino A - Peito e Tríceps", "Treino Inferiores", etc.). Se não houver explícito, deduza pelos grupos musculares.
2. "division": A letra ou identificador da divisão (ex: "A", "B", "C", "D", "Superior", "Inferior").
3. "weekDays": Dias sugeridos (ex: ["Seg", "Qua", "Sex"]) caso constem. Se não constar, retorne array vazio [].
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

    // 1. Tentar Gemini 3.6 Flash
    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`;
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
          rawContent = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } else {
          const errText = await geminiResponse.text();
          console.error("Erro na resposta do Gemini:", geminiResponse.status, errText);
        }
      } catch (err) {
        console.error("Exceção na chamada do Gemini:", err);
      }
    }

    // 2. Fallback para OpenAI se Gemini falhou ou não tem chave
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
