const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const API_KEY = process.env.GEMINI_API_KEY || "";

const rawDatasetPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_raw.json');
const outputPath = path.join(__dirname, '..', 'prisma', 'seeds', 'mapped_core_gifs.json');

const translationDict = {
  "abdominal": ["sit-up", "crunch", "abdominal", "sit up"],
  "canivete": ["jackknife", "jack knife"],
  "giro": ["twist"],
  "russo": ["russian"],
  "infra": ["lying leg raise", "leg raise", "knee raise", "infra"],
  "vela": ["candle", "hip raise", "vertical leg raise"],
  "solo": ["floor", "lying", "mat"],
  "serrote": ["row", "one arm row"],
  "supra": ["crunch", "sit-up"],
  "abdução": ["abduction", "abductor"],
  "adução": ["adduction", "adductor"],
  "afundo": ["lunge"],
  "agachamento": ["squat"],
  "elevação": ["raise", "elevation"],
  "pélvica": ["hip thrust", "pelvic", "bridge"],
  "crucifixo": ["fly", "rear delt fly", "reverse fly"],
  "supino": ["bench press", "chest press", "press"],
  "puxada": ["pulldown", "pull down", "pull-up", "pullup"],
  "remada": ["row", "rowing"],
  "rosca": ["curl"],
  "extensão": ["extension"],
  "flexão": ["curl", "push-up", "pushup", "flexion"],
  "desenvolvimento": ["shoulder press", "overhead press", "military press", "press"],
  "tríceps": ["triceps", "kickback", "pushdown"],
  "bíceps": ["biceps", "curl"],
  "ombro": ["shoulder"],
  "peito": ["chest", "pectoral"],
  "costas": ["back", "lat"],
  "perna": ["leg"],
  "panturrilha": ["calf", "calves"],
  "posterior": ["hamstring", "leg curl"],
  "quadríceps": ["quads", "quadriceps", "leg extension"],
  "alongamento": ["stretch", "stretching"],
  "mobilidade": ["mobility", "stretch"],
  "aquecimento": ["warm up", "warm-up"],
  "corrida": ["run", "running", "treadmill"],
  "esteira": ["treadmill"],
  "elíptico": ["elliptical"],
  "bicicleta": ["bike", "cycle", "bicycle"],
  "pullover": ["pullover"],
  "voador": ["pec deck", "fly", "chest fly"],
  "cross": ["cable", "crossover"],
  "polia": ["cable"],
  "halteres": ["dumbbell"],
  "barra": ["barbell", "bar"],
  "kettlebell": ["kettlebell"],
  "elástico": ["band", "resistance band"],
  "máquina": ["machine", "leverage"],
  "step": ["step", "box"],
  "bola": ["ball", "stability ball", "medicine ball"],
  "prancha": ["plank"],
  "perdigueiro": ["bird dog", "birddog"],
  "sprint": ["sprint", "run"],
  "stiff": ["stiff", "deadlift", "romanian deadlift"],
  "terra": ["deadlift"],
  "remador": ["rower", "rowing machine"],
  "reto": ["flat", "straight"],
  "inclinado": ["incline", "inclined"],
  "declinado": ["decline", "declined"],
  "em pé": ["standing"],
  "sentado": ["seated"],
  "deitado": ["lying", "supine"],
  "cruzado": ["crossover", "cross"],
  "isometrico": ["isometric", "hold"],
  "isométrico": ["isometric", "hold"],
  "unilateral": ["single arm", "single leg", "one arm", "one leg", "unilateral"],
  "bilateral": ["bilateral"],
  "pronada": ["pronated", "overhand"],
  "supinada": ["supinated", "underhand"],
  "neutra": ["neutral"],
  "martelo": ["hammer"],
  "concentrada": ["concentration"],
  "apoiado": ["supported"],
  "escorado": ["supported"],
  "inverso": ["reverse"],
  "atrás": ["behind", "rear"],
  "frente": ["front"],
  "alto": ["high"],
  "baixo": ["low"],
  "médio": ["middle"],
  "aberto": ["wide"],
  "fechado": ["close", "narrow"],
  "curto": ["short"],
  "completo": ["full"],
  "guiada": ["smith", "smith machine"],
  "guiado": ["smith", "smith machine"],
  "livre": ["free", "body weight"]
};

const muscleGroupMap = {
  "Core": ["abs", "spine", "serratus anterior"],
  "Pernas": ["quads", "calves", "glutes", "hamstrings", "adductors", "abductors"],
  "Cardio": ["cardiovascular system"],
  "Ombros": ["delts", "traps", "levator scapulae"],
  "Costas": ["lats", "upper back", "spine", "traps"],
  "Bíceps": ["biceps", "forearms"],
  "Peito": ["pectorals"],
  "Tríceps": ["triceps"],
  "Aquecimento e Mobilidade": ["abs", "quads", "lats", "calves", "pectorals", "glutes", "hamstrings", "adductors", "triceps", "spine", "upper back", "biceps", "delts", "forearms", "traps", "abductors", "cardiovascular system"]
};

const equipmentMap = {
  "Peso Corporal": ["body weight", "assisted"],
  "Polia": ["cable", "rope"],
  "Elástico": ["band", "resistance band"],
  "Halteres": ["dumbbell"],
  "Barra": ["barbell", "olympic barbell", "ez barbell", "trap bar"],
  "Kettlebell": ["kettlebell"],
  "Máquina": ["leverage machine", "sled machine", "smith machine"],
  "Step": ["body weight", "assisted", "dumbbell"],
  "Bola": ["medicine ball", "stability ball", "bosu ball"],
  "Smith": ["smith machine"]
};

function normalizeText(text) {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-5\s]/g, "")
    .trim();
}

function getEnglishKeywords(ptName) {
  const normalized = normalizeText(ptName);
  const words = normalized.split(/\s+/);
  let keywords = [];
  words.forEach(word => {
    if (translationDict[word]) {
      keywords = keywords.concat(translationDict[word]);
    } else {
      keywords.push(word);
    }
  });
  return keywords;
}

function calculateScore(keywords, enName, target, equipment, ptMuscle, ptEquip) {
  const normalizedEn = normalizeText(enName);
  const enWords = normalizedEn.split(/\s+/);
  
  const validTargets = muscleGroupMap[ptMuscle] || [];
  const targetMatch = validTargets.includes(target);
  
  const validEquipments = equipmentMap[ptEquip] || [];
  const equipMatch = validEquipments.includes(equipment);
  
  if (!targetMatch && ptMuscle !== "Aquecimento e Mobilidade") {
    return 0;
  }

  let score = 0;
  
  if (equipMatch) {
    score += 5;
  }
  
  keywords.forEach(kw => {
    if (normalizedEn.includes(kw)) {
      score += 10;
      if (enWords.includes(kw)) {
        score += 5;
      }
    }
  });

  const ptWordCount = keywords.length;
  const enWordCount = enWords.length;
  score -= Math.abs(ptWordCount - enWordCount) * 1.5;

  return score;
}

async function callGeminiBatch(batchWithCandidates) {
  const prompt = `
Você é um especialista em educação física e musculação.
Para cada exercício em português listado abaixo, escolha a melhor correspondência em inglês a partir de sua respectiva lista de candidatos.
O objetivo é encontrar o exercício em inglês que execute exatamente o mesmo movimento físico para que possamos usar o GIF dele.
Se nenhum dos candidatos for uma boa correspondência (ou seja, se forem movimentos diferentes), retorne null para "matchedEnglishName".

Retorne APENAS um array JSON contendo objetos no seguinte formato:
[
  { "id": "id_do_exercicio_em_portugues", "matchedEnglishName": "nome_do_exercicio_em_ingles_escolhido" }
]
Retorne APENAS o JSON bruto, sem formatação markdown (como \`\`\`json) ou qualquer outro texto explicativo.

Exercícios e Candidatos:
${JSON.stringify(batchWithCandidates, null, 2)}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("Erro na API Gemini:", data.error.message);
      return [];
    }

    let textResponse = data.candidates[0].content.parts[0].text;
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(textResponse);
  } catch (error) {
    console.error('Erro ao chamar o Gemini:', error);
    return [];
  }
}

async function main() {
  console.log("Lendo exercícios do banco de dados com gifUrl nulo...");
  const dbExercises = await prisma.exercise.findMany({
    where: { gifUrl: null }
  });
  console.log(`Total de exercícios sem GIF no DB: ${dbExercises.length}`);

  if (dbExercises.length === 0) {
    console.log("Todos os exercícios já possuem GIF!");
    return;
  }

  console.log("Lendo dataset raw em inglês...");
  const rawEnglishList = JSON.parse(fs.readFileSync(rawDatasetPath, 'utf8'));
  console.log(`Total de exercícios em inglês no dataset: ${rawEnglishList.length}`);

  console.log("Pré-filtrando candidatos locais para cada exercício...");
  const exercisesWithCandidates = dbExercises.map(ptEx => {
    const keywords = getEnglishKeywords(ptEx.name);
    const scoredCandidates = rawEnglishList.map(enEx => {
      const score = calculateScore(
        keywords, 
        enEx.name, 
        enEx.target, 
        enEx.equipment, 
        ptEx.muscleGroup, 
        ptEx.equipment
      );
      return { name: enEx.name, target: enEx.target, equipment: enEx.equipment, score };
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8); // Mantém os 8 melhores candidatos

    return {
      id: ptEx.id,
      name: ptEx.name,
      muscleGroup: ptEx.muscleGroup,
      equipment: ptEx.equipment,
      candidates: scoredCandidates.map(c => ({ name: c.name, target: c.target, equipment: c.equipment }))
    };
  });

  const BATCH_SIZE = 40;
  let allMapped = [];

  if (fs.existsSync(outputPath)) {
    try {
      allMapped = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
      console.log(`Carregado progresso anterior: ${allMapped.length} exercícios mapeados.`);
    } catch (e) {
      console.log("Criando novo mapeamento.");
    }
  }

  const mappedIds = new Set(allMapped.map(m => m.id));
  const remainingExercises = exercisesWithCandidates.filter(ex => !mappedIds.has(ex.id));
  console.log(`Exercícios restantes para processar: ${remainingExercises.length}`);

  for (let i = 0; i < remainingExercises.length; i += BATCH_SIZE) {
    const batch = remainingExercises.slice(i, i + BATCH_SIZE);
    console.log(`Processando lote ${Math.floor(i / BATCH_SIZE) + 1} de ${Math.ceil(remainingExercises.length / BATCH_SIZE)}... (${batch.length} exercícios)`);

    let retries = 0;
    let success = false;

    while (!success && retries < 3) {
      console.log(`Tentativa ${retries + 1}/3...`);
      const result = await callGeminiBatch(batch);

      if (result && result.length > 0) {
        // Encontra o gifUrl correspondente a partir do matchedEnglishName
        const resolvedResult = result.map(match => {
          const ptEx = dbExercises.find(e => e.id === match.id);
          const englishEx = rawEnglishList.find(e => e.name === match.matchedEnglishName);
          return {
            id: match.id,
            portugueseName: ptEx ? ptEx.name : "",
            matchedEnglishName: match.matchedEnglishName,
            gifUrl: englishEx ? englishEx.gif_url : null
          };
        });

        allMapped = allMapped.concat(resolvedResult);
        fs.writeFileSync(outputPath, JSON.stringify(allMapped, null, 2), 'utf8');
        console.log(`Lote concluído e salvo. Total mapeado até agora: ${allMapped.length}`);
        success = true;
      } else {
        retries++;
        if (retries < 3) {
          console.log("Falha ou limite atingido. Aguardando 30 segundos antes de tentar novamente...");
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }
    }

    if (!success) {
      console.log("❌ Parando o processamento devido a falhas consecutivas.");
      break;
    }

    if (i + BATCH_SIZE < remainingExercises.length) {
      console.log("Aguardando 10 segundos antes do próximo lote...");
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log(`\n✅ Mapeamento híbrido concluído! ${allMapped.length} de ${dbExercises.length} exercícios processados.`);
  console.log(`Resultado salvo em: ${outputPath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
