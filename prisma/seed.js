const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const exercisesData = [
  // Peito
  {
    name: "Supino Reto com Barra",
    muscleGroup: "Peito",
    equipment: "Barra",
    description: "Deitado no banco plano, desça a barra até tocar levemente o peito e empurre-a de volta para a posição inicial.",
    videoUrl: "https://www.youtube.com/watch?v=sqOhxRkbdyY",
  },
  {
    name: "Supino Inclinado com Halteres",
    muscleGroup: "Peito",
    equipment: "Halteres",
    description: "Sentado em banco inclinado a 30-45 graus, empurre os halteres para cima de forma controlada.",
    videoUrl: "https://www.youtube.com/watch?v=8iP6npi5FA0",
  },
  {
    name: "Peck Deck (Voador)",
    muscleGroup: "Peito",
    equipment: "Máquina",
    description: "Sentado na máquina voador, junte os braços à frente mantendo os cotovelos levemente flexionados.",
  },
  
  // Costas
  {
    name: "Puxada Aberta na Polia Alta",
    muscleGroup: "Costas",
    equipment: "Polia",
    description: "Puxe a barra em direção ao peito inclinando levemente o tronco para trás e esmagando as escápulas.",
    videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
  },
  {
    name: "Remada Baixa Sentado",
    muscleGroup: "Costas",
    equipment: "Polia",
    description: "Sentado com os pés apoiados, puxe o triângulo em direção ao abdômen mantendo a postura ereta.",
  },
  {
    name: "Remada Curvada com Barra",
    muscleGroup: "Costas",
    equipment: "Barra",
    description: "Incline o tronco à frente a 45 graus, mantendo a coluna alinhada, e puxe a barra na direção do umbigo.",
  },

  // Pernas
  {
    name: "Agachamento Livre com Barra",
    muscleGroup: "Pernas",
    equipment: "Barra",
    description: "Apoie a barra nos ombros, desça flexionando os joelhos e empurrando o quadril para trás, mantendo a coluna ereta.",
    videoUrl: "https://www.youtube.com/watch?v=R2dMsVh128s",
  },
  {
    name: "Leg Press 45",
    muscleGroup: "Pernas",
    equipment: "Máquina",
    description: "Apoie os pés na plataforma na largura dos ombros, empurre e desça flexionando os joelhos até 90 graus.",
  },
  {
    name: "Cadeira Extensora",
    muscleGroup: "Pernas",
    equipment: "Máquina",
    description: "Sente-se com as costas apoiadas e faça a extensão completa dos joelhos de forma controlada.",
  },
  {
    name: "Mesa Flexora",
    muscleGroup: "Pernas",
    equipment: "Máquina",
    description: "Deitado de bruços, flexione os joelhos trazendo os calcanhares em direção ao glúteo.",
  },

  // Ombros
  {
    name: "Desenvolvimento com Halteres",
    muscleGroup: "Ombros",
    equipment: "Halteres",
    description: "Sentado, empurre os halteres acima da cabeça até a extensão quase completa dos braços.",
  },
  {
    name: "Elevação Lateral com Halteres",
    muscleGroup: "Ombros",
    equipment: "Halteres",
    description: "Em pé, eleve os halteres lateralmente até a altura dos ombros, focando na contração do deltoide lateral.",
  },

  // Braços
  {
    name: "Rosca Direta com Barra W",
    muscleGroup: "Braços",
    equipment: "Barra",
    description: "Em pé, flexione os cotovelos trazendo a barra na direção dos ombros sem mover os braços para frente.",
  },
  {
    name: "Tríceps Pulley (Corda)",
    muscleGroup: "Braços",
    equipment: "Polia",
    description: "Segure a corda na polia alta e faça a extensão completa dos cotovelos, abrindo a corda no final do movimento.",
  },

  // Core
  {
    name: "Abdominal Supra",
    muscleGroup: "Core",
    equipment: "Peso Corporal",
    description: "Deitado de costas, flexione o tronco aproximando as costelas do quadril tirando as escápulas do chão.",
  },
  {
    name: "Prancha Isométrica",
    muscleGroup: "Core",
    equipment: "Peso Corporal",
    description: "Apoie os antebraços e as pontas dos pés no chão, mantendo todo o corpo alinhado e o abdômen contraído.",
  },
];

async function main() {
  console.log("Iniciando seed de exercícios...");
  
  for (const exercise of exercisesData) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: exercise,
    });
  }

  console.log("Seed de exercícios concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
