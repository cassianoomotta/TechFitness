const fs = require('fs');
const path = require('path');

const rawDatasetPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_raw.json');
const outputPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_ptbr.json');

const rawData = JSON.parse(fs.readFileSync(rawDatasetPath, 'utf8'));

// Dicionário completo de termos para tradução heurística
const dictionary = {
  // Movimentos Principais (Exercícios)
  "bench press": "supino",
  "chest press": "supino",
  "push-up": "flexão de braço",
  "pushup": "flexão de braço",
  "pull-up": "puxada na barra",
  "pullup": "puxada na barra",
  "chin-up": "puxada supinada na barra",
  "chinup": "puxada supinada na barra",
  "pulldown": "puxada",
  "row": "remada",
  "squat": "agachamento",
  "deadlift": "levantamento terra",
  "stiff leg deadlift": "stiff",
  "stiff-legged deadlift": "stiff",
  "romanian deadlift": "rdl",
  "leg press": "leg press",
  "leg extension": "extensão de pernas",
  "leg curl": "flexão de pernas",
  "lying leg curl": "mesa flexora",
  "seated leg curl": "cadeira flexora",
  "standing leg curl": "flexora em pé",
  "calf raise": "elevação de panturrilha",
  "biceps curl": "rosca bíceps",
  "bicep curl": "rosca bíceps",
  "preacher curl": "rosca scott",
  "concentration curl": "rosca concentrada",
  "hammer curl": "rosca martelo",
  "wrist curl": "rosca de punho",
  "triceps extension": "extensão de tríceps",
  "triceps kickback": "coice de tríceps",
  "triceps pushdown": "tríceps na polia",
  "shrug": "encolhimento de ombro",
  "upright row": "remada alta",
  "lateral raise": "elevação lateral",
  "front raise": "elevação frontal",
  "shoulder press": "desenvolvimento",
  "overhead press": "desenvolvimento",
  "military press": "desenvolvimento militar",
  "arnold press": "desenvolvimento arnold",
  "fly": "crucifixo",
  "crossover": "crossover",
  "cross-over": "crossover",
  "pec deck": "peck deck",
  "pullover": "pullover",
  "crunch": "abdominal",
  "sit-up": "abdominal",
  "sit up": "abdominal",
  "leg raise": "elevação de pernas",
  "knee raise": "elevação de joelhos",
  "plank": "prancha",
  "side plank": "prancha lateral",
  "russian twist": "giro russo",
  "hyperextension": "extensão lombar",
  "lunge": "afundo",
  "step-up": "passada no step",
  "step up": "passada no step",
  "stretch": "alongamento",
  "stretching": "alongamento",
  "mobility": "mobilidade",
  "jumping jack": "polichinelo",
  "burpee": "burpee",
  "mountain climber": "escalador",
  "jump rope": "pular corda",
  
  // Equipamentos / Acessórios
  "barbell": "com barra",
  "dumbbell": "com halter",
  "cable": "na polia",
  "machine": "na máquina",
  "band": "com elástico",
  "resistance band": "com elástico",
  "kettlebell": "com kettlebell",
  "medicine ball": "com bola medicinal",
  "stability ball": "na bola suíça",
  "exercise ball": "na bola suíça",
  "bosu ball": "no bosu",
  "bosu": "no bosu",
  "smith": "no smith",
  "lever": "na máquina articulada",
  "sled": "no leg press",
  "wheel roller": "com roda abdominal",
  "roller": "com rolo",
  
  // Posições / Direções
  "seated": "sentado",
  "standing": "em pé",
  "lying": "deitado",
  "decline": "declinado",
  "incline": "inclinado",
  "flat": "reto",
  "prone": "pronado",
  "supine": "supinado",
  "kneeling": "ajoelhado",
  "half kneeling": "semiajoelhado",
  "one arm": "unilateral",
  "single arm": "unilateral",
  "two arm": "bilateral",
  "single leg": "unilateral",
  "one leg": "unilateral",
  "supported": "apoiado",
  "chest supported": "com apoio no peito",
  
  // Detalhes de Execução
  "close grip": "pegada fechada",
  "wide grip": "pegada aberta",
  "reverse grip": "pegada invertida",
  "pronated": "pronada",
  "supinated": "supinada",
  "neutral grip": "pegada neutra",
  "behind neck": "nuca",
  "behind the neck": "por trás da nuca",
  "alternate": "alternado",
  "assisted": "assistido",
  "weighted": "com carga"
};

// Dicionário de Grupos Musculares
const muscleGroupsMap = {
  'abs': 'Core',
  'quads': 'Pernas',
  'lats': 'Costas',
  'calves': 'Panturrilhas',
  'pectorals': 'Peito',
  'glutes': 'Glúteos',
  'hamstrings': 'Pernas',
  'adductors': 'Pernas',
  'triceps': 'Tríceps',
  'cardiovascular system': 'Cardio',
  'spine': 'Core',
  'upper back': 'Costas',
  'biceps': 'Braços',
  'delts': 'Ombros',
  'forearms': 'Antebraços',
  'traps': 'Costas',
  'serratus anterior': 'Core',
  'abductors': 'Pernas',
  'levator scapulae': 'Pescoço',
  'waist': 'Core',
  'upper legs': 'Pernas',
  'back': 'Costas',
  'lower legs': 'Panturrilhas',
  'chest': 'Peito',
  'upper arms': 'Braços',
  'cardio': 'Cardio',
  'shoulders': 'Ombros',
  'lower arms': 'Antebraços',
  'neck': 'Pescoço'
};

// Dicionário de Equipamentos
const equipmentsMap = {
  'body weight': 'Peso Corporal',
  'cable': 'Polia',
  'leverage machine': 'Máquina Articulada',
  'assisted': 'Máquina',
  'medicine ball': 'Acessório',
  'stability ball': 'Bola Suíça',
  'band': 'Elástico',
  'barbell': 'Barra',
  'rope': 'Corda',
  'dumbbell': 'Halteres',
  'ez barbell': 'Barra W',
  'sled machine': 'Máquina',
  'upper body ergometer': 'Máquina',
  'kettlebell': 'Kettlebell',
  'olympic barbell': 'Barra Olímpica',
  'weighted': 'Peso Corporal',
  'bosu ball': 'Acessório',
  'resistance band': 'Elástico',
  'roller': 'Acessório',
  'skierg machine': 'Máquina',
  'hammer': 'Máquina',
  'smith machine': 'Barra Guiada (Smith)',
  'wheel roller': 'Roda Abdominal',
  'stationary bike': 'Bicicleta',
  'tire': 'Outro',
  'trap bar': 'Barra Hexagonal',
  'elliptical machine': 'Máquina',
  'stepmill machine': 'Simulador de Escada'
};

function translateName(name) {
  let lower = name.toLowerCase().trim();
  
  // Casos especiais diretos
  if (lower === "3/4 sit-up") return "Abdominal 3/4";
  if (lower === "air bike") return "Bicicleta ergométrica ar";
  if (lower === "burpee") return "Burpee";
  
  // Ordena as chaves do maior para o menor para evitar substituições parciais incorretas
  const sortedKeys = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  
  let equipment = "";
  let position = "";
  let exercise = "";
  let details = [];
  
  // Extrair componentes conhecidos do nome em inglês
  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      const val = dictionary[key];
      // Classifica o termo traduzido
      if (["com barra", "com halter", "na polia", "na máquina", "com elástico", "com kettlebell", "com bola medicinal", "na bola suíça", "no bosu", "no smith", "na máquina articulada", "no leg press", "com roda abdominal", "com rolo"].includes(val)) {
        if (!equipment) {
          equipment = val;
          lower = lower.replace(key, "");
        }
      } else if (["sentado", "em pé", "deitado", "declinado", "inclinado", "reto", "pronado", "supinado", "ajoelhado", "semiajoelhado"].includes(val)) {
        if (!position) {
          position = val;
          lower = lower.replace(key, "");
        }
      } else if (["supino", "flexão de braço", "puxada na barra", "puxada supinada na barra", "puxada", "remada", "agachamento", "levantamento terra", "stiff", "rdl", "leg press", "extensão de pernas", "flexão de pernas", "mesa flexora", "cadeira flexora", "flexora em pé", "elevação de panturrilha", "rosca bíceps", "rosca scott", "rosca concentrada", "rosca martelo", "rosca de punho", "extensão de tríceps", "coice de tríceps", "tríceps na polia", "encolhimento de ombro", "remada alta", "elevação lateral", "elevação frontal", "desenvolvimento", "desenvolvimento militar", "desenvolvimento arnold", "crucifixo", "crossover", "peck deck", "pullover", "abdominal", "elevação de pernas", "elevação de joelhos", "prancha", "prancha lateral", "giro russo", "extensão lombar", "afundo", "passada no step", "alongamento", "mobilidade", "polichinelo", "burpee", "escalador", "pular corda"].includes(val)) {
        if (!exercise) {
          exercise = val;
          lower = lower.replace(key, "");
        }
      } else {
        if (!details.includes(val)) {
          details.push(val);
          lower = lower.replace(key, "");
        }
      }
    }
  }
  
  // Se sobrou alguma palavra não traduzida (como nome de músculo específico ou detalhe raro), limpa caracteres especiais e anexa
  let remaining = lower.replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
  if (remaining && remaining.length > 2) {
    // Dicionário rápido de termos remanescentes comuns
    const quickMap = {
      "calves": "para panturrilhas",
      "chest": "peitoral",
      "back": "costas",
      "hamstring": "posterior",
      "quadriceps": "quadrípces",
      "glute": "glúteos",
      "neck": "pescoço",
      "shoulder": "ombros",
      "triceps": "tríceps",
      "biceps": "bíceps",
      "forearm": "antebraço",
      "ankle": "tornozelo",
      "wrist": "punho",
      "finger": "dedos",
      "groin": "virilha",
      "hip": "quadril",
      "abductor": "abdutores",
      "adductor": "adutores",
      "toe": "dedos do pé",
      "knee": "joelhos",
      "wheel": "roda",
      "hand": "mão"
    };
    for (const k of Object.keys(quickMap)) {
      if (remaining.includes(k)) {
        details.push(quickMap[k]);
        remaining = remaining.replace(k, "");
      }
    }
    remaining = remaining.trim();
    if (remaining && remaining.length > 2) {
      details.push(remaining);
    }
  }
  
  // Se não identificou o exercício principal, usa o nome original
  if (!exercise) {
    return name;
  }
  
  // Monta a frase em português seguindo a ordem natural de musculação:
  // [Exercício] + [Detalhe] + [Posição] + [Equipamento]
  let finalName = exercise;
  if (details.length > 0) finalName += " " + details.join(" ");
  if (position) finalName += " " + position;
  if (equipment) finalName += " " + equipment;
  
  // Remove espaços duplicados e limpa pontuações
  finalName = finalName.replace(/\s+/g, ' ').replace(/\(\s*\)/g, '').trim();
  
  // Capitaliza a primeira letra
  return finalName.charAt(0).toUpperCase() + finalName.slice(1);
}

// Mapeamento dos 1324 exercícios
const translatedList = rawData.map(ex => {
  const muscleGroup = muscleGroupsMap[ex.target] || muscleGroupsMap[ex.category || ex.body_part] || 'Geral';
  const equipment = equipmentsMap[ex.equipment] || 'Peso Corporal';
  const translatedName = translateName(ex.name);
  
  return {
    name: translatedName,
    muscleGroup: muscleGroup,
    equipment: equipment,
    description: ex.instructions?.en || null,
    gifUrl: ex.gif_url || null,
    videoUrl: null
  };
});

// Evitar nomes duplicados na lista gerada
const nameCounts = new Map();
translatedList.forEach(ex => {
  nameCounts.set(ex.name, (nameCounts.get(ex.name) || 0) + 1);
});

const finalUniqueList = [];
const usedNames = new Set();

translatedList.forEach(ex => {
  let uniqueName = ex.name;
  if (nameCounts.get(ex.name) > 1) {
    // Adiciona o grupo muscular ou equipamento para diferenciar
    uniqueName = `${ex.name} (${ex.muscleGroup} - ${ex.equipment})`;
  }
  
  // Se ainda for duplicado, coloca um contador numérico sequencial
  let counter = 2;
  let finalName = uniqueName;
  while (usedNames.has(finalName)) {
    finalName = `${uniqueName} ${counter}`;
    counter++;
  }
  
  usedNames.add(finalName);
  finalUniqueList.push({
    ...ex,
    name: finalName
  });
});

fs.writeFileSync(outputPath, JSON.stringify(finalUniqueList, null, 2), 'utf-8');
console.log(`Sucesso! ${finalUniqueList.length} exercícios traduzidos e salvos em: ${outputPath}`);
