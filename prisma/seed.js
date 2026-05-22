const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const exercisesData = [
  // PEITO
  {
    name: "Supino Reto com Barra",
    muscleGroup: "Peito",
    equipment: "Barra",
    description: "Deitado no banco plano, desça a barra até tocar levemente o peito e empurre-a de volta para a posição inicial.",
    videoUrl: "https://www.youtube.com/shorts/ZL-sw4fqkE4",
  },
  {
    name: "Supino Reto com Halteres",
    muscleGroup: "Peito",
    equipment: "Halteres",
    description: "Deitado no banco reto, empurre os halteres para cima mantendo a estabilidade dos ombros.",
    videoUrl: "https://www.youtube.com/shorts/JlnIpcMpkuw",
  },
  {
    name: "Supino Inclinado com Halteres",
    muscleGroup: "Peito",
    equipment: "Halteres",
    description: "Sentado em banco inclinado a 30-45 graus, empurre os halteres para cima de forma controlada.",
    videoUrl: "https://www.youtube.com/watch?v=L5mYF7tfl4A", // Supino Articulado / Inclinado
  },
  {
    name: "Peck Deck (Voador)",
    muscleGroup: "Peito",
    equipment: "Máquina",
    description: "Sentado na máquina voador, junte os braços à frente mantendo os cotovelos levemente flexionados.",
    videoUrl: "https://www.youtube.com/shorts/3NzHyUoRJ0A", // Crucifixo Máquina
  },
  {
    name: "Crossover na Polia Média",
    muscleGroup: "Peito",
    equipment: "Polia",
    description: "Em pé entre as polias, traga as manoplas para a frente do corpo cruzando levemente as mãos.",
    videoUrl: "https://www.youtube.com/watch?v=_QOrf0oI69Q", // Crucifixo no Cross
  },
  {
    name: "Flexão de Braço",
    muscleGroup: "Peito",
    equipment: "Peso Corporal",
    description: "Apoie as mãos no chão ligeiramente mais abertas que os ombros e flexione os cotovelos até quase tocar o peito.",
    videoUrl: "https://www.youtube.com/shorts/dTCO9wDonTE", // Anti Rotação / Estabilização
  },

  // COSTAS
  {
    name: "Puxada Aberta na Polia Alta",
    muscleGroup: "Costas",
    equipment: "Polia",
    description: "Puxe a barra em direção ao peito inclinando levemente o tronco para trás e esmagando as escápulas.",
    videoUrl: "https://www.youtube.com/shorts/58l3JzLKhf8", // Puxada Alta Pronada
  },
  {
    name: "Remada Baixa Sentado",
    muscleGroup: "Costas",
    equipment: "Polia",
    description: "Sentado com os pés apoiados, puxe o triângulo em direção ao abdômen mantendo a postura ereta.",
    videoUrl: "https://www.youtube.com/shorts/na-lNfQQkYk", // Remada Baixa Triângulo
  },
  {
    name: "Remada Curvada com Barra",
    muscleGroup: "Costas",
    equipment: "Barra",
    description: "Incline o tronco à frente a 45 graus, mantendo a coluna alinhada, e puxe a barra na direção do umbigo.",
    videoUrl: "https://www.youtube.com/shorts/ZCLySTuhTyg", // Remada Curvada Pronada
  },
  {
    name: "Puxada Fechada (Triângulo)",
    muscleGroup: "Costas",
    equipment: "Polia",
    description: "Utilizando a manopla de triângulo na polia alta, puxe-a na direção do peito abrindo o peitoral.",
    videoUrl: "https://www.youtube.com/shorts/3IGToev6BEo", // Puxada Alta Triângulo
  },
  {
    name: "Remada Unilateral com Halter (Serrote)",
    muscleGroup: "Costas",
    equipment: "Halteres",
    description: "Apoiado no banco plano, puxe o halter na lateral do tronco trazendo o cotovelo além da linha das costas.",
    videoUrl: "https://www.youtube.com/shorts/95WbXV7LKCo", // Remada Unilateral Serrote
  },
  {
    name: "Levantamento Terra",
    muscleGroup: "Costas",
    equipment: "Barra",
    description: "Com a barra no chão, suba estendendo o quadril e os joelhos de forma síncrona mantendo o abdômen travado.",
    videoUrl: "https://www.youtube.com/shorts/k6eZCDVNWco", // Levantamento Terra Tradicional
  },

  // PERNAS
  {
    name: "Agachamento Livre com Barra",
    muscleGroup: "Pernas",
    equipment: "Barra",
    description: "Apoie a barra nos ombros, desça flexionando os joelhos e empurrando o quadril para trás, mantendo a coluna ereta.",
    videoUrl: "https://www.youtube.com/shorts/RQhnPIIk4BU", // Agachamento Smith
  },
  {
    name: "Leg Press 45",
    muscleGroup: "Pernas",
    equipment: "Máquina",
    description: "Apoie os pés na plataforma na largura dos ombros, empurre e desça flexionando os joelhos até 90 graus.",
    videoUrl: "https://www.youtube.com/shorts/HITlVV4eXSA", // Leg Press 45 Bilateral
  },
  {
    name: "Cadeira Extensora",
    muscleGroup: "Pernas",
    equipment: "Máquina",
    description: "Sente-se com as costas apoiadas e faça a extensão completa dos joelhos de forma controlada.",
    videoUrl: "https://www.youtube.com/shorts/Pj4zPwCDLN0", // Cadeira Extensora Bilateral
  },
  {
    name: "Mesa Flexora",
    muscleGroup: "Pernas",
    equipment: "Máquina",
    description: "Deitado de bruços, flexione os joelhos trazendo os calcanhares em direção ao glúteo.",
    videoUrl: "https://www.youtube.com/shorts/DYfZ_m-yciE", // Cadeira Flexora Bilateral
  },
  {
    name: "Afundo com Halteres",
    muscleGroup: "Pernas",
    equipment: "Halteres",
    description: "Dê um passo à frente e desça o quadril verticalmente até que o joelho de trás quase toque o chão.",
    videoUrl: "https://www.youtube.com/shorts/BeOtD76Z6nU", // Afundo com Halteres
  },
  {
    name: "Stiff com Halteres",
    muscleGroup: "Pernas",
    equipment: "Halteres",
    description: "Flexione levemente os joelhos e desça os halteres rente às pernas, empurrando o quadril para trás.",
    videoUrl: "https://www.youtube.com/shorts/Z4aQruKglOM", // Terra Sumô / Posterior
  },
  {
    name: "Elevação Pélvica na Máquina/Barra",
    muscleGroup: "Pernas",
    equipment: "Barra",
    description: "Apoie as costas no banco e a barra no quadril, faça a extensão do quadril empurrando com os calcanhares.",
    videoUrl: "https://www.youtube.com/watch?v=KCVEEVzbPIs", // Elevação Pélvica
  },

  // OMBROS
  {
    name: "Desenvolvimento com Halteres",
    muscleGroup: "Ombros",
    equipment: "Halteres",
    description: "Sentado, empurre os halteres acima da cabeça até a extensão quase completa dos braços.",
    videoUrl: "https://www.youtube.com/shorts/4yNsA3Vf1g8", // Desenvolvimento Halteres
  },
  {
    name: "Elevação Lateral com Halteres",
    muscleGroup: "Ombros",
    equipment: "Halteres",
    description: "Em pé, eleve os halteres lateralmente até a altura dos ombros, focando na contração do deltoide lateral.",
    videoUrl: "https://www.youtube.com/shorts/0WxSGB5cvEw", // Elevação Lateral Halter
  },
  {
    name: "Crucifixo Invertido com Halteres",
    muscleGroup: "Ombros",
    equipment: "Halteres",
    description: "Incline o tronco à frente e abra os braços lateralmente trabalhando o deltoide posterior.",
    videoUrl: "https://www.youtube.com/shorts/uY5kRo_iyl8", // Crucifixo Invertido Máquina
  },

  // BRAÇOS (BÍCEPS & TRÍCEPS)
  {
    name: "Rosca Direta com Barra W",
    muscleGroup: "Braços",
    equipment: "Barra",
    description: "Em pé, flexione os cotovelos trazendo a barra na direção dos ombros sem mover os braços para frente.",
    videoUrl: "https://www.youtube.com/watch?v=35BxIpDbLD8", // Rosca Bíceps Barra W
  },
  {
    name: "Rosca Martelo com Halteres",
    muscleGroup: "Braços",
    equipment: "Halteres",
    description: "Com pegada neutra (palmas para dentro), faça a flexão de cotovelos de forma alternada ou simultânea.",
    videoUrl: "https://www.youtube.com/shorts/BH4RDHryDbU", // Rosca Direta Halteres
  },
  {
    name: "Rosca Concentrada",
    muscleGroup: "Braços",
    equipment: "Halteres",
    description: "Sentado com o cotovelo apoiado na parte interna da coxa, realize a rosca isolando o bíceps.",
    videoUrl: "https://www.youtube.com/shorts/l5b_u4OW2GY", // Rosca Alternada Halteres
  },
  {
    name: "Tríceps Pulley (Corda)",
    muscleGroup: "Braços",
    equipment: "Polia",
    description: "Segure a corda na polia alta e faça a extensão completa dos cotovelos, abrindo a corda no final.",
    videoUrl: "https://www.youtube.com/shorts/nkhwFKpEhgw", // Tríceps Corda
  },
  {
    name: "Tríceps Testa com Barra W",
    muscleGroup: "Braços",
    equipment: "Barra",
    description: "Deitado, segure a barra acima do peito e flexione os cotovelos trazendo a barra na direção da testa.",
    videoUrl: "https://www.youtube.com/shorts/x9lbdH8qbHM", // Tríceps Testa Barra W
  },
  {
    name: "Mergulho no Banco (Tríceps)",
    muscleGroup: "Braços",
    equipment: "Peso Corporal",
    description: "Apoie as mãos no banco atrás do corpo e desça o quadril flexionando os cotovelos até 90 graus.",
    videoUrl: "https://www.youtube.com/shorts/nkhwFKpEhgw", // Tríceps Corda / Geral
  },

  // CORE (ABDÔMEN & LOMBAR)
  {
    name: "Abdominal Supra",
    muscleGroup: "Core",
    equipment: "Peso Corporal",
    description: "Deitado de costas, flexione o tronco aproximando as costelas do quadril tirando as escápulas do chão.",
    videoUrl: "https://www.youtube.com/watch?v=RoUF4-uMy6s", // Abdominal Bicicleta
  },
  {
    name: "Prancha Isométrica",
    muscleGroup: "Core",
    equipment: "Peso Corporal",
    description: "Apoie os antebraços e as pontas dos pés no chão, mantendo todo o corpo alinhado e o abdômen contraído.",
    videoUrl: "https://www.youtube.com/shorts/fKkarqjGve8", // Prancha Isométrica
  },
  {
    name: "Abdominal Infra na Paralela",
    muscleGroup: "Core",
    equipment: "Máquina",
    description: "Apoiado nos antebraços na paralela, eleve as pernas flexionando os joelhos em direção ao abdômen.",
    videoUrl: "https://www.youtube.com/watch?v=jEn6g6AzoZw", // Abdominal Infra na Paralela
  },

  // PANTURRILHAS
  {
    name: "Gêmeos em Pé na Máquina",
    muscleGroup: "Panturrilhas",
    equipment: "Máquina",
    description: "Apoie os ombros nas almofadas, posicione as pontas dos pés na plataforma e faça a extensão do tornozelo.",
    videoUrl: "https://www.youtube.com/watch?v=2DXK28kqnfQ", // Alongamento/Trabalho Panturrilha
  },
  {
    name: "Gêmeos Sentado na Máquina",
    muscleGroup: "Panturrilhas",
    equipment: "Máquina",
    description: "Sentado na máquina de panturrilha, solte o freio e realize a flexão plantar completa.",
    videoUrl: "https://www.youtube.com/watch?v=2DXK28kqnfQ",
  },
];

async function main() {
  console.log("Iniciando seed de banco de dados expandido com links das playlists do YouTube...");
  
  await prisma.exercise.deleteMany({});
  console.log("Limpeza de biblioteca de exercícios concluída.");

  for (const exercise of exercisesData) {
    await prisma.exercise.create({
      data: exercise,
    });
  }

  console.log(`Seed finalizado com sucesso! ${exercisesData.length} exercícios criados na biblioteca.`);
}

main()
  .catch((e) => {
    console.error("Erro ao rodar o seed expandido:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
