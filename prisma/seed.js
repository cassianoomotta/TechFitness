const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const exercisesData = [
  {
    "name": "Abdominal Canivete",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=GKE_laVIxFk"
  },
  {
    "name": "Abdominal Canivete com Bola",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=WFjTjENjJYQ"
  },
  {
    "name": "Abdominal Canivete Cruzado",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=TdG-b4E7fro"
  },
  {
    "name": "Abdominal Canivete Isometrico",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=e1DRNdwyBMQ"
  },
  {
    "name": "Abdominal Canoa Isometrico",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=XkYdcYEyjKM"
  },
  {
    "name": "Abdominal Giro Russo",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eRb8_FTwr0s"
  },
  {
    "name": "Abdominal Infra Isometrico",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Nu9Y0RTDib4"
  },
  {
    "name": "Abdominal Infra na Paralela",
    "muscleGroup": "Core",
    "equipment": "Máquina",
    "description": "Apoiado nos antebraços na paralela, eleve as pernas flexionando os joelhos em direção ao abdômen.",
    "videoUrl": "https://www.youtube.com/watch?v=jEn6g6AzoZw"
  },
  {
    "name": "Abdominal Infra no Banco",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Jm9N7T99xkk"
  },
  {
    "name": "Abdominal Infra no Solo",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=jqbGOOArtUc"
  },
  {
    "name": "Abdominal Infra Vela no Solo",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Fm6PxM4d2h4"
  },
  {
    "name": "Abdominal Inrfra Alternado",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ATio7MMIltA"
  },
  {
    "name": "Abdominal Serrote na Polia",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gO71GLyEFoQ"
  },
  {
    "name": "Abdominal Supra",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": "Deitado de costas, flexione o tronco aproximando as costelas do quadril tirando as escápulas do chão.",
    "videoUrl": "https://www.youtube.com/watch?v=RoUF4-uMy6s"
  },
  {
    "name": "Abdução de Quadril 3 Apoios",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=-3qQYNnaMoI"
  },
  {
    "name": "Abdução de Quadril com Elástico",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LmFM7JxufV0"
  },
  {
    "name": "Abdução de Quadril em Pé na Polia",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=HI7w-Nw_VKY"
  },
  {
    "name": "Abdução de Quadril no Solo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=bnvOjk76rGE"
  },
  {
    "name": "Abdução de Quadril Sentado com Elástico",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=oz573L2s6n4"
  },
  {
    "name": "Abdução e Extensão de Quadril com Elástico",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=jqxd5pKXuAw"
  },
  {
    "name": "Abdutora",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Zv6-elri_8c"
  },
  {
    "name": "Abdutora Quadril Suspenso",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=dzN_llBOGHo"
  },
  {
    "name": "Abdutora Tronco Inclinado",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Z7qSNTjTE7s"
  },
  {
    "name": "Abdutora Tronco Inclinado Atrás",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=UtBtasGfPug"
  },
  {
    "name": "Adução na Polia",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Rdt5S_I4Ao4"
  },
  {
    "name": "Adutora",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eivdSyNGxhs"
  },
  {
    "name": "Afundo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=rGcSMLbU4IA"
  },
  {
    "name": "Afundo com Halteres",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": "Dê um passo à frente e desça o quadril verticalmente até que o joelho de trás quase toque o chão.",
    "videoUrl": "https://www.youtube.com/shorts/BeOtD76Z6nU"
  },
  {
    "name": "Afundo com Step",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=fS7dalFU0qI"
  },
  {
    "name": "Afundo Explosivo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Tfe4fqz0UUk"
  },
  {
    "name": "Afundo na Barra Guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=_U_sX4bIQEE"
  },
  {
    "name": "Afundo no Step",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1aOQUohr-JY"
  },
  {
    "name": "Afundo no Step (2)",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=SQKu_0b4LYw"
  },
  {
    "name": "Agachamento Afastado com Halter",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9uhVyihQAH0"
  },
  {
    "name": "Agachamento Barra Hexagonal",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Ha-E7AUmjY0"
  },
  {
    "name": "Agachamento com Halter",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=vcJJQZCZn3E"
  },
  {
    "name": "Agachamento com Salto",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9YeCZsVHGEU"
  },
  {
    "name": "Agachamento Frontal",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=z6dmHQOreGE"
  },
  {
    "name": "Agachamento Frontal Anilha",
    "muscleGroup": "Pernas",
    "equipment": "Anilha",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=0xPJJLHHiiI"
  },
  {
    "name": "Agachamento Insiste",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=-We7g2bgq0A"
  },
  {
    "name": "Agachamento Isométrico na Parede",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=QUw-vetcQN0"
  },
  {
    "name": "Agachamento Livre",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xoGNyB4UQOI"
  },
  {
    "name": "Agachamento Livre com Barra",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": "Apoie a barra nos ombros, desça flexionando os joelhos e empurrando o quadril para trás, mantendo a coluna ereta.",
    "videoUrl": "https://www.youtube.com/shorts/RQhnPIIk4BU"
  },
  {
    "name": "Agachamento Máquina de Frente",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=rKW0nXteHyY"
  },
  {
    "name": "Agachamento na Barra Guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=h2D7nDY_UNY"
  },
  {
    "name": "Agachamento na Máquina de Costas",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1LLU2juoFiU"
  },
  {
    "name": "Agachamento na Polia",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eoQsQ-MnG40"
  },
  {
    "name": "Agachamento Overhead",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ixhShnTJIsY"
  },
  {
    "name": "Agachamento Peso Corporal",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1enl54eMLGc"
  },
  {
    "name": "Agachamento Sem Carga com Elástico",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=tkmUjqYrwOo"
  },
  {
    "name": "Agachamento Sumô",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1qpgAGYSsyU"
  },
  {
    "name": "Agachamento Sumô na Barra Guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=3CHGWflAgec"
  },
  {
    "name": "Agachamento Taça",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wNsszcBSPnQ"
  },
  {
    "name": "Agachamento Tripla Extensão",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eVOHjIlsmUo"
  },
  {
    "name": "Agachamento Tripla Extensão Barra Guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=JyM46ENseoo"
  },
  {
    "name": "Alongamento de Adutores na Parede",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=kI2lO_Xy6hE"
  },
  {
    "name": "Alongamento de Adutores no Espaldar",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=cteB1lIkWj8"
  },
  {
    "name": "Alongamento de Biceps",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ob6YJyiFdgs"
  },
  {
    "name": "Alongamento de Iliopsoas",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9E-sipOFU-g"
  },
  {
    "name": "Alongamento de Panturrilha no Espaldar",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=px9lyqLYlag"
  },
  {
    "name": "Alongamento de Panturrilha no Kettbell",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gz2BMBP6ybM"
  },
  {
    "name": "Alongamento de Posterior Bilateral na Parede",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LpIUmbKBopk"
  },
  {
    "name": "Alongamento de Posterior Dinâmico com Fita",
    "muscleGroup": "Mobilidade",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=m_VQQY4N4sE"
  },
  {
    "name": "Anti-Rotação Acima da Cabeça",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=39WS0Cik--s"
  },
  {
    "name": "Anti-Rotação Acima da Cabeça (2)",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=TBimT5BOQU0"
  },
  {
    "name": "Anti-Rotação na Polia",
    "muscleGroup": "Core",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Br8UrEbZ8nY"
  },
  {
    "name": "Anti-Rotação Pallof Press",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=4nZcepfPtK4"
  },
  {
    "name": "Anti-Rotação Posição de Afundo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=3H4GQd-0f4g"
  },
  {
    "name": "Arremesso",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=l57W92VD5Sw"
  },
  {
    "name": "Ativação Glúteo Médio",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=I59H2IqzBC8"
  },
  {
    "name": "Avanço",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=BcOe805l8uk"
  },
  {
    "name": "Aviãozinho na Polia",
    "muscleGroup": "Outros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=XguIB3J9pIQ"
  },
  {
    "name": "Barra Fixa Graviton Aberta",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=YRigeNY1QlY"
  },
  {
    "name": "Barra Fixa Graviton Fechada",
    "muscleGroup": "Costas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=X1Lc5yWsQHM"
  },
  {
    "name": "Barra Fixa Pronada",
    "muscleGroup": "Costas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=8JtgV1g2g7k"
  },
  {
    "name": "Barra Fixa Supinada",
    "muscleGroup": "Costas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=QH64ZHr6lgo"
  },
  {
    "name": "Bike",
    "muscleGroup": "Cardio",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=rbLBH4CkLoM"
  },
  {
    "name": "Bom Dia",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ezzB_vnG1UE"
  },
  {
    "name": "Búlgaro",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=DmkCSyzVXJc"
  },
  {
    "name": "Búlgaro Explosivo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=3VpZ8YZeZHo"
  },
  {
    "name": "Cadeira Extensora",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": "Sente-se com as costas apoiadas e faça a extensão completa dos joelhos de forma controlada.",
    "videoUrl": "https://www.youtube.com/shorts/Pj4zPwCDLN0"
  },
  {
    "name": "Cadeira Flexora",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=3G6G3LXEvUQ"
  },
  {
    "name": "Cadeira Flexora Unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=aINWvk_g_t4"
  },
  {
    "name": "Caminhada na Esteira",
    "muscleGroup": "Cardio",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=HKaG19T6myg"
  },
  {
    "name": "Chop Rotacional Posição de Afundo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9BRs2Gix66s"
  },
  {
    "name": "Corda Naval Alternado",
    "muscleGroup": "Cardio",
    "equipment": "Corda Naval",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=r0XLK4E_yDs"
  },
  {
    "name": "Corda Naval Bilateral",
    "muscleGroup": "Cardio",
    "equipment": "Corda Naval",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KJNiABJBMX4"
  },
  {
    "name": "Corrida Estacionária",
    "muscleGroup": "Cardio",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=pT-ZCJjdYZc"
  },
  {
    "name": "Corrida na Esteira",
    "muscleGroup": "Cardio",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=YIRTbVdFty0"
  },
  {
    "name": "Cross Over",
    "muscleGroup": "Peito",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ogzsr19m4rs"
  },
  {
    "name": "Crossover na Polia Média",
    "muscleGroup": "Peito",
    "equipment": "Polia",
    "description": "Em pé entre as polias, traga as manoplas para a frente do corpo cruzando levemente as mãos.",
    "videoUrl": "https://www.youtube.com/watch?v=_QOrf0oI69Q"
  },
  {
    "name": "Crucifixo Inverso com Halter",
    "muscleGroup": "Peito",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=2e-IGU4T5uY"
  },
  {
    "name": "Crucifixo Inverso no Cross",
    "muscleGroup": "Peito",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=0C1D2KYia9c"
  },
  {
    "name": "Crucifixo Invertido com Halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": "Incline o tronco à frente e abra os braços lateralmente trabalhando o deltoide posterior.",
    "videoUrl": "https://www.youtube.com/shorts/uY5kRo_iyl8"
  },
  {
    "name": "Desenvolvimento com Halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": "Sentado, empurre os halteres acima da cabeça até a extensão quase completa dos braços.",
    "videoUrl": "https://www.youtube.com/shorts/4yNsA3Vf1g8"
  },
  {
    "name": "Desenvolvimento Frontal Barra H",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=a8euMgeGj7g"
  },
  {
    "name": "Desenvolvimento Livre com Halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=JqdK1KMI1us"
  },
  {
    "name": "Elevação Conjugada",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KRfgko2Iroo"
  },
  {
    "name": "Elevação Frontal Barra H",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=WEW99wQk_-Y"
  },
  {
    "name": "Elevação Frontal com Anilha",
    "muscleGroup": "Ombros",
    "equipment": "Anilha",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=EpiifwInlp8"
  },
  {
    "name": "Elevação Frontal com Aproximação",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=20Q1L7ndbDU"
  },
  {
    "name": "Elevação Frontal com Halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=PNMsAivexFE"
  },
  {
    "name": "Elevação Frontal na Polia com Corda",
    "muscleGroup": "Ombros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=58nhcBdE6F4"
  },
  {
    "name": "Elevação Frontal na Polia Pegada Pronada",
    "muscleGroup": "Ombros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=GAlVCffg7f8"
  },
  {
    "name": "Elevação Frontal Neutra",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=zVBuEsaQoEQ"
  },
  {
    "name": "Elevação Lateral",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=SgKwoMb4D9U"
  },
  {
    "name": "Elevação Lateral com Halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": "Em pé, eleve os halteres lateralmente até a altura dos ombros, focando na contração do deltoide lateral.",
    "videoUrl": "https://www.youtube.com/shorts/0WxSGB5cvEw"
  },
  {
    "name": "Elevação Lateral na Polia Unilateral",
    "muscleGroup": "Ombros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=d1I658GMUvg"
  },
  {
    "name": "Elevação Lateral Neutra",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=iCQpV0WuY30"
  },
  {
    "name": "Elevação Lateral Peito Apoiado no Banco",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=iTjxX9CWqBs"
  },
  {
    "name": "Elevação Lateral Sentado",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=PC9Hmnkd4Ew"
  },
  {
    "name": "Elevação Lateral Unilateral Inclinado na Polia",
    "muscleGroup": "Ombros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=05dtpG6ep_8"
  },
  {
    "name": "Elevação Pélvica",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=-d8elW_SqHQ"
  },
  {
    "name": "Elevação Pélvica com Elástico Solo",
    "muscleGroup": "Outros",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=rGVsmsIglRQ"
  },
  {
    "name": "Elevação Pélvica Isométrica com Abdução",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=q2P2y7ujpZA"
  },
  {
    "name": "Elevação Pélvica na Máquina/barra",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": "Apoie as costas no banco e a barra no quadril, faça a extensão do quadril empurrando com os calcanhares.",
    "videoUrl": "https://www.youtube.com/watch?v=KCVEEVzbPIs"
  },
  {
    "name": "Elevação Pélvica Unilateral Banco",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=IDEZ77rdD2E"
  },
  {
    "name": "Elevacao Pélvica Unilateral com Abdução",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=OgMgWDV276g"
  },
  {
    "name": "Elevação Pélvica Unilateral Solo",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xpdmT6NPmpQ"
  },
  {
    "name": "Elevação Y",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LT1bmEr18lA"
  },
  {
    "name": "Elevação Y com Elástico",
    "muscleGroup": "Mobilidade",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=6m8rozpDahk"
  },
  {
    "name": "Elíptico",
    "muscleGroup": "Cardio",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=CFyy1lOWKh8"
  },
  {
    "name": "Estabilização de Escápulas no Espaldar",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=dqT6Oc22b-A"
  },
  {
    "name": "Extensão de Quadril com Elástico",
    "muscleGroup": "Outros",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=x4T_3o3tLI0"
  },
  {
    "name": "Extensão de Quadril na Polia (Coice)",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=kvz1Knfhvak"
  },
  {
    "name": "Extensão de Quadril na Polia Perna Estendida",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=lrvcVGDQT0M"
  },
  {
    "name": "Extensora Bilateral",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=sHIFVwfbcLA"
  },
  {
    "name": "Extensora Tronco Inclinado",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=WsL3F6GYquw"
  },
  {
    "name": "Extensora Unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=YlWMKiYvqlE"
  },
  {
    "name": "Face Pull",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=zM43C_-p1EM"
  },
  {
    "name": "Flexão de Braço",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": "Apoie as mãos no chão ligeiramente mais abertas que os ombros e flexione os cotovelos até quase tocar o peito.",
    "videoUrl": "https://www.youtube.com/shorts/dTCO9wDonTE"
  },
  {
    "name": "Flexão de Braços",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=qVq2_0SBVJs"
  },
  {
    "name": "Flexão de Braços Ajoelhado",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=hHHx3AqESik"
  },
  {
    "name": "Flexão de Joelho em Pé Caneleira",
    "muscleGroup": "Outros",
    "equipment": "Caneleira",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=RveboRfM0to"
  },
  {
    "name": "Flexão de Joelho em Pé na Polia",
    "muscleGroup": "Outros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=HNr9TY1p-4c"
  },
  {
    "name": "Flexão de Quadril com Elástico",
    "muscleGroup": "Outros",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=VWNJhoEzu7Q"
  },
  {
    "name": "Flexão Nórdica",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Kwj_NznO7rE"
  },
  {
    "name": "Flexão Nórdica Reversa",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=IbFv9J4o-gI"
  },
  {
    "name": "Flexão Plantar com Elástico",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=f85OjocSOrA"
  },
  {
    "name": "Fly Inclinado",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ZAOsoTbAk8I"
  },
  {
    "name": "Gêmeos em Pé na Máquina",
    "muscleGroup": "Panturrilhas",
    "equipment": "Máquina",
    "description": "Apoie os ombros nas almofadas, posicione as pontas dos pés na plataforma e faça a extensão do tornozelo.",
    "videoUrl": "https://www.youtube.com/watch?v=2DXK28kqnfQ"
  },
  {
    "name": "Gêmeos Sentado na Máquina",
    "muscleGroup": "Panturrilhas",
    "equipment": "Máquina",
    "description": "Sentado na máquina de panturrilha, solte o freio e realize a flexão plantar completa.",
    "videoUrl": "https://www.youtube.com/watch?v=2DXK28kqnfQ"
  },
  {
    "name": "Glúteo 4 Apoios Perna Estendida",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=6I1vXzcf1zw"
  },
  {
    "name": "Glúteo 4 Apoios Perna Flexionada",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xGWthEoq8KQ"
  },
  {
    "name": "Glúteo Concha",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=YXvNbClsjA8"
  },
  {
    "name": "Glúteo Estendido Cruzado",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=yZ49_0xjX8k"
  },
  {
    "name": "Kipping + Flexão de Braços",
    "muscleGroup": "Cardio",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5ihTyFNWDPw"
  },
  {
    "name": "Landmine Press em Pé",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=OZedIWKaCTA"
  },
  {
    "name": "Landmine Press Semi Ajoelhado",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5v3RHdurh-M"
  },
  {
    "name": "Leg 180 Pés Altos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=SNmpBS4robY"
  },
  {
    "name": "Leg 180 Pés Baixos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=jIfL0U-YEcw"
  },
  {
    "name": "Leg 180 Unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=B5cQunAv4K0"
  },
  {
    "name": "Leg 35",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=FsanVfvUcII"
  },
  {
    "name": "Leg 45 Pés Abduzidos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=954tc-olxAk"
  },
  {
    "name": "Leg 45 Pés Altos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=zl0IoxfuEuU"
  },
  {
    "name": "Leg 45 Pés Baixos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Zxx5_Yo-g_0"
  },
  {
    "name": "Leg Press 45",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": "Apoie os pés na plataforma na largura dos ombros, empurre e desça flexionando os joelhos até 90 graus.",
    "videoUrl": "https://www.youtube.com/shorts/HITlVV4eXSA"
  },
  {
    "name": "Levantamento Sumô",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=VmKJ3gect58"
  },
  {
    "name": "Levantamento Terra",
    "muscleGroup": "Costas",
    "equipment": "Barra",
    "description": "Com a barra no chão, suba estendendo o quadril e os joelhos de forma síncrona mantendo o abdômen travado.",
    "videoUrl": "https://www.youtube.com/shorts/k6eZCDVNWco"
  },
  {
    "name": "Levantamento Terra Barra Hexagonal",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eSY_fyndzFM"
  },
  {
    "name": "Liberação na Torácica",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=-3mgBUY6UUo"
  },
  {
    "name": "Lift Posição de Afundo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=bA37GcoJfgw"
  },
  {
    "name": "Mergulho no Banco (Tríceps)",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": "Apoie as mãos no banco atrás do corpo e desça o quadril flexionando os cotovelos até 90 graus.",
    "videoUrl": "https://www.youtube.com/shorts/nkhwFKpEhgw"
  },
  {
    "name": "Mesa Flexora",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": "Deitado de bruços, flexione os joelhos trazendo os calcanhares em direção ao glúteo.",
    "videoUrl": "https://www.youtube.com/shorts/DYfZ_m-yciE"
  },
  {
    "name": "Mesa Flexora Unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=DHKPeaW49VM"
  },
  {
    "name": "Mobilidade de Tornozelo no Caixote",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=UWBaYxrQWjw"
  },
  {
    "name": "Mobilidade de Tornozelo Semiajoelhado",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=SYFux3PSpmQ"
  },
  {
    "name": "Mobilidade de Tornozelo Semiajoelhado 2",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=JgxmviF87_M"
  },
  {
    "name": "Mobilidade Torácica Caixote Bastão",
    "muscleGroup": "Mobilidade",
    "equipment": "Outros",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=t5zw3_aPIr4"
  },
  {
    "name": "Mobilidade Torácica e de Ombro na Parede Semi Ajoelhado",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=RuyhUaHlGw8"
  },
  {
    "name": "Mobilidade Torácica Gato e Camelo",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1H5QPV3JkIw"
  },
  {
    "name": "Mobilidade Torácica Gato e Camelo no Caixote",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=46w7IfkqxYk"
  },
  {
    "name": "Mobilidade Torácica na Parede Semi Ajoelhado",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5InkVT7Yq4Q"
  },
  {
    "name": "Mobilidade Torácica no Caixote",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=MQMSS_vE1T4"
  },
  {
    "name": "Panturrilha Inclinado Joelho Elevado À Frente",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=kikubfpx8Zw"
  },
  {
    "name": "Panturrilha na Barra Guiada com Step",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=54hhKYNu9d8"
  },
  {
    "name": "Panturrilha na Maquina de Agachamento",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=F8agcVvigNc"
  },
  {
    "name": "Panturrilha no Solo na Barra Guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5nOaGAnHlxI"
  },
  {
    "name": "Panturrilha no Step",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=odFX9wkQKWw"
  },
  {
    "name": "Panturrilha no Step Unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wMH4YZDwb7g"
  },
  {
    "name": "Passada Caranguejo com Movimento",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gCqHpHUP6Ow"
  },
  {
    "name": "Passada Caranguejo Estático",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=spoN9Rvq5a8"
  },
  {
    "name": "Peck Deck (Voador)",
    "muscleGroup": "Peito",
    "equipment": "Máquina",
    "description": "Sentado na máquina voador, junte os braços à frente mantendo os cotovelos levemente flexionados.",
    "videoUrl": "https://www.youtube.com/shorts/3NzHyUoRJ0A"
  },
  {
    "name": "Polichinelo",
    "muscleGroup": "Cardio",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=RQlKDwSw7gg"
  },
  {
    "name": "Prancha Frontal com Elástico e Movimentação de Pernas",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ugR56aDVxHM"
  },
  {
    "name": "Prancha Isométrica",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": "Apoie os antebraços e as pontas dos pés no chão, mantendo todo o corpo alinhado e o abdômen contraído.",
    "videoUrl": "https://www.youtube.com/shorts/fKkarqjGve8"
  },
  {
    "name": "Prancha Lateral com Abdução de Pernas",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wMZKeIB_AWk"
  },
  {
    "name": "Prancha Lateral com Glúteo Concha",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=X2T25FNVLb0"
  },
  {
    "name": "Pull Down com Barra Reta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=XF7uc-Mz_ZM"
  },
  {
    "name": "Pull Down com Corda",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=cljclnFIKCo"
  },
  {
    "name": "Pull Down com Corda Sentado",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=N-Ivf7_kfBA"
  },
  {
    "name": "Pulley Articulado",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Dhgbx9myv3s"
  },
  {
    "name": "Pulley Articulado Unilateral",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=C3gltd1a-Ls"
  },
  {
    "name": "Pulley Frontal Aberto",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=fKhu0pUQ294"
  },
  {
    "name": "Pulley Frontal Barra Anatômica",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=JFdegj1GNcc"
  },
  {
    "name": "Pulley Frontal com Barra Estribo Curta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KFPsvhQtqnc"
  },
  {
    "name": "Pulley Frontal com Triângulo",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=AqVJvaYsi5I"
  },
  {
    "name": "Pulley Supinado",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xC1hFQVuZv8"
  },
  {
    "name": "Puxada Aberta na Polia Alta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": "Puxe a barra em direção ao peito inclinando levemente o tronco para trás e esmagando as escápulas.",
    "videoUrl": "https://www.youtube.com/shorts/58l3JzLKhf8"
  },
  {
    "name": "Puxada Fechada (Triângulo)",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": "Utilizando a manopla de triângulo na polia alta, puxe-a na direção do peito abrindo o peitoral.",
    "videoUrl": "https://www.youtube.com/shorts/3IGToev6BEo"
  },
  {
    "name": "RDL",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=cm0YHXsOrh0"
  },
  {
    "name": "RDL Unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=O6rl-6JQnxM"
  },
  {
    "name": "Recuo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=NcFqOJqZ_GA"
  },
  {
    "name": "Recuo com Step",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=mZC_ItW7NSQ"
  },
  {
    "name": "Recuo na Barra Guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Rj25-lXI9vo"
  },
  {
    "name": "Recuo no Step",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=XS22Tngv8nI"
  },
  {
    "name": "Remada Articulada Aberta",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=h-glAsX6gqo"
  },
  {
    "name": "Remada Articulada Aberta Unilateral",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=14vSLvxgKVc"
  },
  {
    "name": "Remada Articulada Fechada",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ItPYxgnQZBM"
  },
  {
    "name": "Remada Articulada Fechada Unilateral",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=VvtgoP5u_Ks"
  },
  {
    "name": "Remada Baixa Aberta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=oU8VDKR-xIA"
  },
  {
    "name": "Remada Baixa Barra Anatômica",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=suC3mO2NrKk"
  },
  {
    "name": "Remada Baixa com Barra Estribo Curta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ACgU7gH8NYU"
  },
  {
    "name": "Remada Baixa com Triângulo",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Dq5QoRYbCrs"
  },
  {
    "name": "Remada Baixa Sentado",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": "Sentado com os pés apoiados, puxe o triângulo em direção ao abdômen mantendo a postura ereta.",
    "videoUrl": "https://www.youtube.com/shorts/na-lNfQQkYk"
  },
  {
    "name": "Remada Baixa Supinada",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=MMzBG3lUeDo"
  },
  {
    "name": "Remada Baixa Unilateral",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=sOnXPISYgXg"
  },
  {
    "name": "Remada Cavalinho Máquina",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=sJOQr0mSPFU"
  },
  {
    "name": "Remada Cavalinho no Suporte",
    "muscleGroup": "Costas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=3YlMCwa5C9A"
  },
  {
    "name": "Remada Curvada com Barra",
    "muscleGroup": "Costas",
    "equipment": "Barra",
    "description": "Incline o tronco à frente a 45 graus, mantendo a coluna alinhada, e puxe a barra na direção do umbigo.",
    "videoUrl": "https://www.youtube.com/shorts/ZCLySTuhTyg"
  },
  {
    "name": "Remada na Polia Alta com Corda",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ZRMwgEAgfQo"
  },
  {
    "name": "Remada na Polia Baixa com Triângulo",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=BXjBtkNHLf8"
  },
  {
    "name": "Remada na Polia Baixa Supinada",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=pk7mAWFQw7Q"
  },
  {
    "name": "Remada Unilateral com Halter (Serrote)",
    "muscleGroup": "Costas",
    "equipment": "Halteres",
    "description": "Apoiado no banco plano, puxe o halter na lateral do tronco trazendo o cotovelo além da linha das costas.",
    "videoUrl": "https://www.youtube.com/shorts/95WbXV7LKCo"
  },
  {
    "name": "Remada Unilateral na Polia Baixa",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=rSqlQUmiJMg"
  },
  {
    "name": "Remada Unilateral Polia Alta Sentado",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=r9Lmo_EX_V8"
  },
  {
    "name": "Retração de Escapulas no Pulley",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=aTwQVcizDsA"
  },
  {
    "name": "Rosca Biceps 21",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xcQtEc9ysYM"
  },
  {
    "name": "Rosca Bíceps 21",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=G0m5jP7C-1A"
  },
  {
    "name": "Rosca Bíceps Barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=nmY1EM6WI0w"
  },
  {
    "name": "Rosca Biceps com Giro",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=cIrUAToYxAY"
  },
  {
    "name": "Rosca Bíceps com Giro",
    "muscleGroup": "Braços",
    "equipment": "Kettlebell",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=PqShZz6N-xM"
  },
  {
    "name": "Rosca Bíceps Corda na Polia",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=oMTC9Ifm7Vw"
  },
  {
    "name": "Rosca Bíceps na Polia Alta",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KpVkjHSYWvo"
  },
  {
    "name": "Rosca com Giro Banco 60°",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gxJnGF_pKio"
  },
  {
    "name": "Rosca Concentrada",
    "muscleGroup": "Braços",
    "equipment": "Halteres",
    "description": "Sentado com o cotovelo apoiado na parte interna da coxa, realize a rosca isolando o bíceps.",
    "videoUrl": "https://www.youtube.com/shorts/l5b_u4OW2GY"
  },
  {
    "name": "Rosca Direta Alternada",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=S83rJFTBOp8"
  },
  {
    "name": "Rosca Direta Banco 60°",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=fCFUtsinDuM"
  },
  {
    "name": "Rosca Direta com Barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": "Em pé, flexione os cotovelos trazendo a barra na direção dos ombros sem mover os braços para frente.",
    "videoUrl": "https://www.youtube.com/watch?v=35BxIpDbLD8"
  },
  {
    "name": "Rosca Direta com Desenvolvimento",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=vIDHNQrK3Tg"
  },
  {
    "name": "Rosca Direta com Halteres",
    "muscleGroup": "Braços",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=jTYbykP91vI"
  },
  {
    "name": "Rosca Direta na Polia Barra Reta",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=_dC7hRgeR9Y"
  },
  {
    "name": "Rosca Direta no Aparelho Funcional",
    "muscleGroup": "Braços",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=NJdoqVW4Yzs"
  },
  {
    "name": "Rosca Direta Pegada Pronada",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=CafXdOgww4I"
  },
  {
    "name": "Rosca Martelo Alternada",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=yqYdPpXrCAA"
  },
  {
    "name": "Rosca Martelo Banco 60°",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wlISRIeP8tg"
  },
  {
    "name": "Rosca Martelo Barra H",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gocf3-nePpI"
  },
  {
    "name": "Rosca Martelo com Elástico",
    "muscleGroup": "Braços",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LW7EC4a4Tow"
  },
  {
    "name": "Rosca Martelo com Halteres",
    "muscleGroup": "Braços",
    "equipment": "Halteres",
    "description": "Com pegada neutra (palmas para dentro), faça a flexão de cotovelos de forma alternada ou simultânea.",
    "videoUrl": "https://www.youtube.com/shorts/BH4RDHryDbU"
  },
  {
    "name": "Rosca Martelo no Scott Unilateral",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=_-pecjXwuEU"
  },
  {
    "name": "Rosca Punho Antebraço",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=w0ZSoP9QivE"
  },
  {
    "name": "Rosca Scott Barra H",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=pECq6xDL5jk"
  },
  {
    "name": "Rosca Scott Barra Reta",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=cdo1wAOnBZ0"
  },
  {
    "name": "Rosca Scott Barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=kzgkkHKty1I"
  },
  {
    "name": "Rosca Spider",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gYr2VIIobcw"
  },
  {
    "name": "Rosca Unilateral na Polia",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=AjP7irEtB-A"
  },
  {
    "name": "Rotação Externa Bilateral Halter Decúbito Dorsal",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=hD-63xfepcM"
  },
  {
    "name": "Rotação Externa com Barra Unilateral",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=2FxJzyhh6Yw"
  },
  {
    "name": "Rotação Externa na Parede",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=CsuweSHZMFc"
  },
  {
    "name": "Rotação Externa Unilateral com Elástico",
    "muscleGroup": "Ombros",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=zBwRcnj-PNE"
  },
  {
    "name": "Salto de Corda",
    "muscleGroup": "Cardio",
    "equipment": "Outros",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=i4gMHCk5sKY"
  },
  {
    "name": "Salto no Caixote",
    "muscleGroup": "Cardio",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=6_5F_FiB5Uk"
  },
  {
    "name": "Seated Leg Press",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9e-Plzvvj3E"
  },
  {
    "name": "Sentar e Levantar",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=OYAzBGS7xIw"
  },
  {
    "name": "Snatch Alternado",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KA0lSCTI06I"
  },
  {
    "name": "Snatch Landmine",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=7HIkxErc7iI"
  },
  {
    "name": "Stiff",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=QE9oPdgm9z0"
  },
  {
    "name": "Stiff Abduzido",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=FMHw-exGgxI"
  },
  {
    "name": "Stiff com Halteres",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": "Flexione levemente os joelhos e desça os halteres rente às pernas, empurrando o quadril para trás.",
    "videoUrl": "https://www.youtube.com/shorts/Z4aQruKglOM"
  },
  {
    "name": "Stiff na Máquina",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=GSWxaUuc36I"
  },
  {
    "name": "Stiff na Polia",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=2oJkwwqg9XU"
  },
  {
    "name": "Stiff Reverso",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=HqaBUet26_w"
  },
  {
    "name": "Stiff Unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xpLsFO1Zhz0"
  },
  {
    "name": "Subida no Caixote",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ra3RcUYVwZ8"
  },
  {
    "name": "Subida no Caixote Over Burpeer",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eDR0doEfVFE"
  },
  {
    "name": "Subida no Caixote Over Sprawls",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=6SXL6T79A2U"
  },
  {
    "name": "Subida no Caixote Perna Estática",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=DiSFfxUlh4w"
  },
  {
    "name": "Supino Inclinado Barra Guiada",
    "muscleGroup": "Peito",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=8wyfA27ORKo"
  },
  {
    "name": "Supino Inclinado com Barra",
    "muscleGroup": "Peito",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1Y7MQ2IGvFk"
  },
  {
    "name": "Supino Inclinado com Halteres",
    "muscleGroup": "Peito",
    "equipment": "Halteres",
    "description": "Sentado em banco inclinado a 30-45 graus, empurre os halteres para cima de forma controlada.",
    "videoUrl": "https://www.youtube.com/watch?v=L5mYF7tfl4A"
  },
  {
    "name": "Supino Inclinado Máquina Funcional",
    "muscleGroup": "Peito",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=CStHJSJFAFY"
  },
  {
    "name": "Supino Reto Barra Guiada",
    "muscleGroup": "Peito",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9uR1ykwA8EY"
  },
  {
    "name": "Supino Reto com Barra",
    "muscleGroup": "Peito",
    "equipment": "Barra",
    "description": "Deitado no banco plano, desça a barra até tocar levemente o peito e empurre-a de volta para a posição inicial.",
    "videoUrl": "https://www.youtube.com/shorts/ZL-sw4fqkE4"
  },
  {
    "name": "Supino Reto com Halteres",
    "muscleGroup": "Peito",
    "equipment": "Halteres",
    "description": "Deitado no banco reto, empurre os halteres para cima mantendo a estabilidade dos ombros.",
    "videoUrl": "https://www.youtube.com/shorts/JlnIpcMpkuw"
  },
  {
    "name": "Swing",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ORIHpdApWp0"
  },
  {
    "name": "Thruster",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=NRCBhzkOCwY"
  },
  {
    "name": "Thruster com Halter",
    "muscleGroup": "Outros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Ik57T5PQxj0"
  },
  {
    "name": "Thruster Ladmine",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=VFj04eGoyZY"
  },
  {
    "name": "Thruster Landmine",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=8nTbHpIZTcQ"
  },
  {
    "name": "Tibial Anterior",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=I8EG9Zz2ynI"
  },
  {
    "name": "Tibial Anterior na Parede",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=RFHshgcWjs8"
  },
  {
    "name": "Touch Down",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=GxeaOzYEo1Y"
  },
  {
    "name": "Tríceps Arremesso Barra Reta",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=98toqd2XkCE"
  },
  {
    "name": "Tríceps Arremesso Barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5SAL8hTOfPM"
  },
  {
    "name": "Tríceps Arremesso Corda",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gz8T2thf3BI"
  },
  {
    "name": "Tríceps Arremesso Pronado",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=am6WQW0iwc8"
  },
  {
    "name": "Tríceps Arremesso Unilateral com Corda",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LtoxYz8yEtM"
  },
  {
    "name": "Tríceps Coice com Corda",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=N5QDpZ5m_Vo"
  },
  {
    "name": "Tríceps Coice com Halter",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=i2vsWh6Hiq0"
  },
  {
    "name": "Tríceps Corda",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=2Xo32BKyTVk"
  },
  {
    "name": "Tríceps Francês",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Sa1Go2jK4cY"
  },
  {
    "name": "Tríceps Francês com Halter",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gTF-0imbH1g"
  },
  {
    "name": "Tríceps Francês Unilateral",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=vGbZLj1l5EM"
  },
  {
    "name": "Tríceps Inverso",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=nc9btW9-7oo"
  },
  {
    "name": "Tríceps Martelo Unilateral",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=sUZvir4UKvo"
  },
  {
    "name": "Tríceps na Polia Barra Reta",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=oWDmzZAh5t0"
  },
  {
    "name": "Tríceps na Polia Barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=FhOlDndu_Fs"
  },
  {
    "name": "Tríceps Pulley (Corda)",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": "Segure a corda na polia alta e faça a extensão completa dos cotovelos, abrindo a corda no final.",
    "videoUrl": "https://www.youtube.com/shorts/nkhwFKpEhgw"
  },
  {
    "name": "Tríceps Testa Barra H",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xLQkiwFcvQM"
  },
  {
    "name": "Tríceps Testa Barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wKDgqNrESIE"
  },
  {
    "name": "Tríceps Testa Barra W Inclinado",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ZVEUdGPYQDs"
  },
  {
    "name": "Tríceps Testa com Barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": "Deitado, segure a barra acima do peito e flexione os cotovelos trazendo a barra na direção da testa.",
    "videoUrl": "https://www.youtube.com/shorts/x9lbdH8qbHM"
  },
  {
    "name": "Tríceps Testa com Halter",
    "muscleGroup": "Braços",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=7Lb3Z1Wvsuo"
  },
  {
    "name": "Tríceps Testa na Polia Baixa",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=358kK-VQNBE"
  },
  {
    "name": "Tríceps Unilateral Supinado",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=WPPdgxA2bHA"
  },
  {
    "name": "Voador",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Kr5U8ZUjroM"
  },
  {
    "name": "Wall Ball",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Q3pj-DRsiQQ"
  },
  {
    "name": "Wall Drill",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=6Y37ckJ4BA0"
  }
];

async function main() {
  console.log("Iniciando seed de banco de dados expandido com links das playlists do YouTube...");
  console.log("Inserindo/atualizando exercícios na biblioteca...");
  
  for (const exercise of exercisesData) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        description: exercise.description,
        videoUrl: exercise.videoUrl,
      },
      create: exercise,
    });
  }

  const total = await prisma.exercise.count();
  console.log(`Seed finalizado com sucesso! ${exercisesData.length} exercícios processados. Total no banco: ${total}`);
}

main()
  .catch((e) => {
    console.error("Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
