const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const rawDatasetPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_raw.json');

const translationDict = {
  // Exercícios / Movimentos
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
  
  // Direções / Posições
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

// Mapeamento de grupos musculares
const muscleGroupMap = {
  "Core": ["abs", "spine", "serratus anterior"],
  "Pernas": ["quads", "calves", "glutes", "hamstrings", "adductors", "abductors"],
  "Cardio": ["cardiovascular system"],
  "Ombros": ["delts", "traps", "levator scapulae"],
  "Costas": ["lats", "upper back", "spine", "traps"],
  "Bíceps": ["biceps", "forearms"],
  "Peito": ["pectorals"],
  "Tríceps": ["triceps"],
  "Aquecimento e Mobilidade": ["abs", "quads", "lats", "calves", "pectorals", "glutes", "hamstrings", "adductors", "triceps", "spine", "upper back", "biceps", "delts", "forearms", "traps", "abductors"]
};

// Mapeamento de equipamentos
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
      // Se não estiver no dicionário, passa a palavra limpa para ver se coincide com termos em inglês (ex: pullover, stiff)
      keywords.push(word);
    }
  });
  return keywords;
}

function calculateScore(keywords, enName, target, equipment, ptMuscle, ptEquip) {
  const normalizedEn = normalizeText(enName);
  const enWords = normalizedEn.split(/\s+/);
  
  // 1. Verificar compatibilidade de grupo muscular
  const validTargets = muscleGroupMap[ptMuscle] || [];
  const targetMatch = validTargets.includes(target);
  
  // 2. Verificar compatibilidade de equipamento
  const validEquipments = equipmentMap[ptEquip] || [];
  const equipMatch = validEquipments.includes(equipment);
  
  if (!targetMatch && ptMuscle !== "Aquecimento e Mobilidade") {
    return 0; // Despenaliza se for de grupo muscular totalmente diferente
  }

  let score = 0;
  
  // Bonus se corresponder ao equipamento exato
  if (equipMatch) {
    score += 5;
  }
  
  // Contar quantas palavras-chave em inglês batem com o nome em inglês
  keywords.forEach(kw => {
    if (normalizedEn.includes(kw)) {
      score += 10;
      // Bônus se for correspondência exata de palavra
      if (enWords.includes(kw)) {
        score += 5;
      }
    }
  });

  // Penalização por diferença de tamanho de palavras para evitar casamentos muito genéricos
  const ptWordCount = keywords.length;
  const enWordCount = enWords.length;
  score -= Math.abs(ptWordCount - enWordCount) * 1.5;

  return score;
}

async function main() {
  console.log("Lendo exercícios do banco de dados sem GIF...");
  const dbExercises = await prisma.exercise.findMany({
    where: { gifUrl: null }
  });
  
  console.log(`Total sem GIF: ${dbExercises.length}`);

  const rawEnglishList = JSON.parse(fs.readFileSync(rawDatasetPath, 'utf8'));
  console.log(`Total dataset em inglês: ${rawEnglishList.length}`);

  const mappings = [];

  dbExercises.forEach(ptEx => {
    const keywords = getEnglishKeywords(ptEx.name);
    let bestMatch = null;
    let maxScore = -999;

    rawEnglishList.forEach(enEx => {
      const score = calculateScore(
        keywords, 
        enEx.name, 
        enEx.target, 
        enEx.equipment, 
        ptEx.muscleGroup, 
        ptEx.equipment
      );

      if (score > maxScore) {
        maxScore = score;
        bestMatch = enEx;
      }
    });

    // Apenas mapeia se o score for razoável (por exemplo, maior que 5)
    if (maxScore > 8) {
      mappings.push({
        ptId: ptEx.id,
        ptName: ptEx.name,
        ptMuscle: ptEx.muscleGroup,
        ptEquip: ptEx.equipment,
        enName: bestMatch.name,
        enTarget: bestMatch.target,
        enEquip: bestMatch.equipment,
        gifUrl: bestMatch.gif_url,
        score: maxScore
      });
    } else {
      mappings.push({
        ptId: ptEx.id,
        ptName: ptEx.name,
        ptMuscle: ptEx.muscleGroup,
        ptEquip: ptEx.equipment,
        enName: null,
        score: maxScore
      });
    }
  });

  console.log("\nAmostra de mapeamentos locais realizados:");
  mappings.slice(0, 30).forEach(m => {
    if (m.enName) {
      console.log(`- ${m.ptName} (${m.ptMuscle}/${m.ptEquip}) ➡️  ${m.enName} (${m.enTarget}/${m.enEquip}) [Score: ${m.score.toFixed(1)}]`);
    } else {
      console.log(`- ${m.ptName} (${m.ptMuscle}/${m.ptEquip}) ➡️  NENHUM PARCEIRO ENCONTRADO [Score: ${m.score.toFixed(1)}]`);
    }
  });

  const matchedCount = mappings.filter(m => m.enName).length;
  console.log(`\nResumo: Mapeados ${matchedCount} de ${dbExercises.length} (${((matchedCount/dbExercises.length)*100).toFixed(1)}%)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
