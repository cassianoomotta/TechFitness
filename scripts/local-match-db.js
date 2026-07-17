const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const rawDatasetPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_raw.json');
const outputPath = path.join(__dirname, '..', 'prisma', 'seeds', 'mapped_core_gifs.json');

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
  "pélvica": ["hip thrust", "pelvic", "bridge", "hip lift"],
  "crucifixo": ["fly", "rear delt fly", "reverse fly", "crossover fly"],
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
  "polia": ["cable", "pulldown", "pulley"],
  "pulley": ["cable", "pulldown", "pushdown"],
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
  "cadeira": ["lever", "seated"],
  "extensora": ["extension", "leg extension"],
  "mesa": ["lying", "bench"],
  "flexora": ["curl", "leg curl"],
  "mergulho": ["dip", "chest dip", "triceps dip"],
  "paralelas": ["parallel bar", "dip"],
  "encolhimento": ["shrug", "shrugs"],
  "tibial": ["tibialis", "calf"],
  "polichinelo": ["jumping jack", "cardiovascular"],
  
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

const muscleGroupMap = {
  "Core": ["abs", "spine", "serratus anterior"],
  "Pernas": ["quads", "calves", "glutes", "hamstrings", "adductors", "abductors"],
  "Ombros": ["delts", "traps", "levator scapulae"],
  "Costas": ["lats", "upper back", "spine", "traps"],
  "Aquecimento e Mobilidade": ["abs", "quads", "lats", "calves", "pectorals", "glutes", "hamstrings", "adductors", "triceps", "spine", "upper back", "biceps", "delts", "forearms", "traps", "abductors", "cardiovascular system"],
  "Cardio": ["cardiovascular system"],
  "Peito": ["pectorals"],
  "Braços": ["biceps", "triceps", "forearms"],
  "Antebraços": ["forearms"],
  "Panturrilhas": ["calves"],
  "Pescoço": ["levator scapulae"]
};

const equipmentMap = {
  "Peso Corporal": ["body weight", "assisted", "stability ball", "bosu ball", "roller", "wheel roller"],
  "Polia": ["cable", "rope"],
  "Elástico": ["band", "resistance band"],
  "Halteres": ["dumbbell", "kettlebell"],
  "Barra": ["barbell", "olympic barbell", "ez barbell", "trap bar"],
  "Kettlebell": ["kettlebell", "dumbbell"],
  "Máquina": ["leverage machine", "sled machine", "smith machine", "elliptical machine", "stationary bike", "stepmill machine"],
  "Step": ["body weight", "assisted", "dumbbell"],
  "Bola": ["medicine ball", "stability ball", "bosu ball"],
  "Smith": ["smith machine"]
};

// Mapeamentos específicos diretos para garantir acurácia de movimentos clássicos
const directPrefixMap = [
  { prefix: "abdominal canivete", en: "jackknife sit-up" },
  { prefix: "abdominal giro russo", en: "russian twist" },
  { prefix: "abdominal infra no banco", en: "lying leg raise" },
  { prefix: "abdominal infra no solo", en: "lying leg raise" },
  { prefix: "abdominal infra vela", en: "lying leg raise" },
  { prefix: "abdominal supra", en: "crunch" },
  { prefix: "cadeira extensora", en: "lever leg extension" },
  { prefix: "mesa flexora", en: "lever lying leg curl" },
  { prefix: "cadeira flexora", en: "lever seated leg curl" },
  { prefix: "levantamento terra", en: "barbell deadlift" },
  { prefix: "rdl", en: "barbell romanian deadlift" },
  { prefix: "stiff", en: "barbell stiff leg deadlift" },
  { prefix: "polichinelo", en: "jumping jack" },
  { prefix: "superman", en: "superman" },
  { prefix: "tibial anterior", en: "posterior tibialis stretch" },
  { prefix: "perdigueiro", en: "bird dog" },
  { prefix: "prancha", en: "plank" },
  { prefix: "rosca concentrada", en: "dumbbell concentration curl" },
  { prefix: "rosca direta", en: "barbell curl" },
  { prefix: "rosca martelo", en: "dumbbell hammer curl" },
  { prefix: "rosca scott", en: "barbell preacher curl" },
  { prefix: "rosca inversa", en: "barbell reverse curl" },
  { prefix: "rosca spider", en: "dumbbell spider curl" },
  { prefix: "triceps corda", en: "cable triceps pushdown" },
  { prefix: "triceps pulley", en: "cable triceps pushdown" },
  { prefix: "triceps testa", en: "barbell lying triceps extension" },
  { prefix: "triceps frances", en: "dumbbell standing triceps extension" },
  { prefix: "mergulho no banco", en: "bench dip" },
  { prefix: "mergulho nas paralelas", en: "chest dip" },
  { prefix: "elevação pélvica", en: "barbell hip thrust" },
  { prefix: "agachamento livre", en: "barbell squat" },
  { prefix: "agachamento sumo", en: "barbell sumo squat" }
];

function normalizeText(text) {
  return text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
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

function calculateScore(keywords, enName, target, equipment, ptMuscle, ptEquip, ptNormalizedName) {
  const normalizedEn = normalizeText(enName);
  const enWords = normalizedEn.split(/\s+/);
  
  const validTargets = muscleGroupMap[ptMuscle] || [];
  const targetMatch = validTargets.includes(target);
  
  const validEquipments = equipmentMap[ptEquip] || [];
  const equipMatch = validEquipments.includes(equipment);
  
  if (!targetMatch && ptMuscle !== "Aquecimento e Mobilidade") {
    return 0;
  }

  // Verificar se há um prefixo direto preferencial
  for (const direct of directPrefixMap) {
    if (ptNormalizedName.startsWith(direct.prefix)) {
      if (normalizedEn.includes(direct.en)) {
        return 100; // Super bônus
      }
    }
  }

  let score = 0;
  
  if (equipMatch) {
    score += 8;
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

  const rawEnglishList = JSON.parse(fs.readFileSync(rawDatasetPath, 'utf8'));
  console.log(`Total de exercícios em inglês no dataset: ${rawEnglishList.length}`);

  const mappings = [];

  dbExercises.forEach(ptEx => {
    const ptNormalized = normalizeText(ptEx.name);
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
        ptEx.equipment,
        ptNormalized
      );

      if (score > maxScore) {
        maxScore = score;
        bestMatch = enEx;
      }
    });

    if (maxScore > 5 && bestMatch) {
      mappings.push({
        id: ptEx.id,
        portugueseName: ptEx.name,
        matchedEnglishName: bestMatch.name,
        gifUrl: bestMatch.gif_url,
        score: maxScore
      });
    } else {
      mappings.push({
        id: ptEx.id,
        portugueseName: ptEx.name,
        matchedEnglishName: null,
        gifUrl: null,
        score: maxScore
      });
    }
  });

  // Salva os mapeamentos em um arquivo
  fs.writeFileSync(outputPath, JSON.stringify(mappings, null, 2), 'utf8');
  console.log(`✅ Mapeamento local concluído e salvo em: ${outputPath}`);

  const matchedCount = mappings.filter(m => m.gifUrl).length;
  console.log(`\nResumo: Mapeados com sucesso ${matchedCount} de ${dbExercises.length} (${((matchedCount/dbExercises.length)*100).toFixed(1)}%)`);

  // Executa o update no banco de dados!
  console.log("\nAtualizando os exercícios no banco de dados Postgres...");
  let updatedCount = 0;
  for (const map of mappings) {
    if (map.gifUrl) {
      await prisma.exercise.update({
        where: { id: map.id },
        data: { gifUrl: map.gifUrl }
      });
      updatedCount++;
    }
  }
  console.log(`✅ Banco de dados atualizado! ${updatedCount} registros atualizados com a URL do GIF.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
