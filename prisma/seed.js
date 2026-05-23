const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const exercisesData = [
  {
    "name": "Abdominal canivete",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=GKE_laVIxFk"
  },
  {
    "name": "Abdominal canivete com bola",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=WFjTjENjJYQ"
  },
  {
    "name": "Abdominal canivete cruzado",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=TdG-b4E7fro"
  },
  {
    "name": "Abdominal canivete isometrico",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=e1DRNdwyBMQ"
  },
  {
    "name": "Abdominal canoa isometrico",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=XkYdcYEyjKM"
  },
  {
    "name": "Abdominal giro russo",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eRb8_FTwr0s"
  },
  {
    "name": "Abdominal infra isometrico",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Nu9Y0RTDib4"
  },
  {
    "name": "Abdominal infra na paralela",
    "muscleGroup": "Core",
    "equipment": "Máquina",
    "description": "Apoiado nos antebraços na paralela, eleve as pernas flexionando os joelhos em direção ao abdômen.",
    "videoUrl": "https://www.youtube.com/watch?v=jEn6g6AzoZw"
  },
  {
    "name": "Abdominal infra no banco",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Jm9N7T99xkk"
  },
  {
    "name": "Abdominal infra no solo",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=jqbGOOArtUc"
  },
  {
    "name": "Abdominal infra vela no solo",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Fm6PxM4d2h4"
  },
  {
    "name": "Abdominal inrfra alternado",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ATio7MMIltA"
  },
  {
    "name": "Abdominal serrote na polia",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gO71GLyEFoQ"
  },
  {
    "name": "Abdominal supra",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": "Deitado de costas, flexione o tronco aproximando as costelas do quadril tirando as escápulas do chão.",
    "videoUrl": "https://www.youtube.com/watch?v=RoUF4-uMy6s"
  },
  {
    "name": "Abdução de quadril 3 apoios",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=-3qQYNnaMoI"
  },
  {
    "name": "Abdução de quadril com elástico",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LmFM7JxufV0"
  },
  {
    "name": "Abdução de quadril em pé na polia",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=HI7w-Nw_VKY"
  },
  {
    "name": "Abdução de quadril no solo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=bnvOjk76rGE"
  },
  {
    "name": "Abdução de quadril sentado com elástico",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=oz573L2s6n4"
  },
  {
    "name": "Abdução e extensão de quadril com elástico",
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
    "name": "Abdutora quadril suspenso",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=dzN_llBOGHo"
  },
  {
    "name": "Abdutora tronco inclinado",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Z7qSNTjTE7s"
  },
  {
    "name": "Abdutora tronco inclinado atrás",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=UtBtasGfPug"
  },
  {
    "name": "Adução na polia",
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
    "name": "Afundo com halteres",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": "Dê um passo à frente e desça o quadril verticalmente até que o joelho de trás quase toque o chão.",
    "videoUrl": "https://www.youtube.com/shorts/BeOtD76Z6nU"
  },
  {
    "name": "Afundo com step",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=fS7dalFU0qI"
  },
  {
    "name": "Afundo explosivo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Tfe4fqz0UUk"
  },
  {
    "name": "Afundo na barra guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=_U_sX4bIQEE"
  },
  {
    "name": "Afundo no step",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1aOQUohr-JY"
  },
  {
    "name": "Afundo no step (2)",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=SQKu_0b4LYw"
  },
  {
    "name": "Agachamento afastado com halter",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9uhVyihQAH0"
  },
  {
    "name": "Agachamento barra hexagonal",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Ha-E7AUmjY0"
  },
  {
    "name": "Agachamento com halter",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=vcJJQZCZn3E"
  },
  {
    "name": "Agachamento com salto",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9YeCZsVHGEU"
  },
  {
    "name": "Agachamento frontal",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=z6dmHQOreGE"
  },
  {
    "name": "Agachamento frontal anilha",
    "muscleGroup": "Pernas",
    "equipment": "Anilha",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=0xPJJLHHiiI"
  },
  {
    "name": "Agachamento insiste",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=-We7g2bgq0A"
  },
  {
    "name": "Agachamento isométrico na parede",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=QUw-vetcQN0"
  },
  {
    "name": "Agachamento livre",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xoGNyB4UQOI"
  },
  {
    "name": "Agachamento livre com barra",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": "Apoie a barra nos ombros, desça flexionando os joelhos e empurrando o quadril para trás, mantendo a coluna ereta.",
    "videoUrl": "https://www.youtube.com/shorts/RQhnPIIk4BU"
  },
  {
    "name": "Agachamento máquina de frente",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=rKW0nXteHyY"
  },
  {
    "name": "Agachamento na barra guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=h2D7nDY_UNY"
  },
  {
    "name": "Agachamento na máquina de costas",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1LLU2juoFiU"
  },
  {
    "name": "Agachamento na polia",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eoQsQ-MnG40"
  },
  {
    "name": "Agachamento overhead",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ixhShnTJIsY"
  },
  {
    "name": "Agachamento peso corporal",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1enl54eMLGc"
  },
  {
    "name": "Agachamento sem carga com elástico",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=tkmUjqYrwOo"
  },
  {
    "name": "Agachamento sumô",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1qpgAGYSsyU"
  },
  {
    "name": "Agachamento sumô na barra guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=3CHGWflAgec"
  },
  {
    "name": "Agachamento taça",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wNsszcBSPnQ"
  },
  {
    "name": "Agachamento tripla extensão",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eVOHjIlsmUo"
  },
  {
    "name": "Agachamento tripla extensão barra guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=JyM46ENseoo"
  },
  {
    "name": "Alongamento de adutores na parede",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=kI2lO_Xy6hE"
  },
  {
    "name": "Alongamento de adutores no espaldar",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=cteB1lIkWj8"
  },
  {
    "name": "Alongamento de biceps",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ob6YJyiFdgs"
  },
  {
    "name": "Alongamento de iliopsoas",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9E-sipOFU-g"
  },
  {
    "name": "Alongamento de panturrilha no espaldar",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=px9lyqLYlag"
  },
  {
    "name": "Alongamento de panturrilha no kettbell",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gz2BMBP6ybM"
  },
  {
    "name": "Alongamento de posterior bilateral na parede",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LpIUmbKBopk"
  },
  {
    "name": "Alongamento de posterior dinâmico com fita",
    "muscleGroup": "Mobilidade",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=m_VQQY4N4sE"
  },
  {
    "name": "Anti-rotação acima da cabeça",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=39WS0Cik--s"
  },
  {
    "name": "Anti-rotação acima da cabeça (2)",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=TBimT5BOQU0"
  },
  {
    "name": "Anti-rotação na polia",
    "muscleGroup": "Core",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Br8UrEbZ8nY"
  },
  {
    "name": "Anti-rotação pallof press",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=4nZcepfPtK4"
  },
  {
    "name": "Anti-rotação posição de afundo",
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
    "name": "Ativação glúteo médio",
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
    "name": "Aviãozinho na polia",
    "muscleGroup": "Outros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=XguIB3J9pIQ"
  },
  {
    "name": "Barra fixa graviton aberta",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=YRigeNY1QlY"
  },
  {
    "name": "Barra fixa graviton fechada",
    "muscleGroup": "Costas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=X1Lc5yWsQHM"
  },
  {
    "name": "Barra fixa pronada",
    "muscleGroup": "Costas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=8JtgV1g2g7k"
  },
  {
    "name": "Barra fixa supinada",
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
    "name": "Bom dia",
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
    "name": "Búlgaro explosivo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=3VpZ8YZeZHo"
  },
  {
    "name": "Cadeira extensora",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": "Sente-se com as costas apoiadas e faça a extensão completa dos joelhos de forma controlada.",
    "videoUrl": "https://www.youtube.com/shorts/Pj4zPwCDLN0"
  },
  {
    "name": "Cadeira flexora",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=3G6G3LXEvUQ"
  },
  {
    "name": "Cadeira flexora unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=aINWvk_g_t4"
  },
  {
    "name": "Caminhada na esteira",
    "muscleGroup": "Cardio",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=HKaG19T6myg"
  },
  {
    "name": "Chop rotacional posição de afundo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9BRs2Gix66s"
  },
  {
    "name": "Corda naval alternado",
    "muscleGroup": "Cardio",
    "equipment": "Corda Naval",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=r0XLK4E_yDs"
  },
  {
    "name": "Corda naval bilateral",
    "muscleGroup": "Cardio",
    "equipment": "Corda Naval",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KJNiABJBMX4"
  },
  {
    "name": "Corrida estacionária",
    "muscleGroup": "Cardio",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=pT-ZCJjdYZc"
  },
  {
    "name": "Corrida na esteira",
    "muscleGroup": "Cardio",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=YIRTbVdFty0"
  },
  {
    "name": "Cross over",
    "muscleGroup": "Peito",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ogzsr19m4rs"
  },
  {
    "name": "Crossover na polia média",
    "muscleGroup": "Peito",
    "equipment": "Polia",
    "description": "Em pé entre as polias, traga as manoplas para a frente do corpo cruzando levemente as mãos.",
    "videoUrl": "https://www.youtube.com/watch?v=_QOrf0oI69Q"
  },
  {
    "name": "Crucifixo inverso com halter",
    "muscleGroup": "Peito",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=2e-IGU4T5uY"
  },
  {
    "name": "Crucifixo inverso no cross",
    "muscleGroup": "Peito",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=0C1D2KYia9c"
  },
  {
    "name": "Crucifixo invertido com halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": "Incline o tronco à frente e abra os braços lateralmente trabalhando o deltoide posterior.",
    "videoUrl": "https://www.youtube.com/shorts/uY5kRo_iyl8"
  },
  {
    "name": "Desenvolvimento com halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": "Sentado, empurre os halteres acima da cabeça até a extensão quase completa dos braços.",
    "videoUrl": "https://www.youtube.com/shorts/4yNsA3Vf1g8"
  },
  {
    "name": "Desenvolvimento frontal barra h",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=a8euMgeGj7g"
  },
  {
    "name": "Desenvolvimento livre com halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=JqdK1KMI1us"
  },
  {
    "name": "Elevação conjugada",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KRfgko2Iroo"
  },
  {
    "name": "Elevação frontal barra h",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=WEW99wQk_-Y"
  },
  {
    "name": "Elevação frontal com anilha",
    "muscleGroup": "Ombros",
    "equipment": "Anilha",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=EpiifwInlp8"
  },
  {
    "name": "Elevação frontal com aproximação",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=20Q1L7ndbDU"
  },
  {
    "name": "Elevação frontal com halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=PNMsAivexFE"
  },
  {
    "name": "Elevação frontal na polia com corda",
    "muscleGroup": "Ombros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=58nhcBdE6F4"
  },
  {
    "name": "Elevação frontal na polia pegada pronada",
    "muscleGroup": "Ombros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=GAlVCffg7f8"
  },
  {
    "name": "Elevação frontal neutra",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=zVBuEsaQoEQ"
  },
  {
    "name": "Elevação lateral",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=SgKwoMb4D9U"
  },
  {
    "name": "Elevação lateral com halteres",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": "Em pé, eleve os halteres lateralmente até a altura dos ombros, focando na contração do deltoide lateral.",
    "videoUrl": "https://www.youtube.com/shorts/0WxSGB5cvEw"
  },
  {
    "name": "Elevação lateral na polia unilateral",
    "muscleGroup": "Ombros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=d1I658GMUvg"
  },
  {
    "name": "Elevação lateral neutra",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=iCQpV0WuY30"
  },
  {
    "name": "Elevação lateral peito apoiado no banco",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=iTjxX9CWqBs"
  },
  {
    "name": "Elevação lateral sentado",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=PC9Hmnkd4Ew"
  },
  {
    "name": "Elevação lateral unilateral inclinado na polia",
    "muscleGroup": "Ombros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=05dtpG6ep_8"
  },
  {
    "name": "Elevação pélvica",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=-d8elW_SqHQ"
  },
  {
    "name": "Elevação pélvica com elástico solo",
    "muscleGroup": "Outros",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=rGVsmsIglRQ"
  },
  {
    "name": "Elevação pélvica isométrica com abdução",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=q2P2y7ujpZA"
  },
  {
    "name": "Elevação pélvica na máquina/barra",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": "Apoie as costas no banco e a barra no quadril, faça a extensão do quadril empurrando com os calcanhares.",
    "videoUrl": "https://www.youtube.com/watch?v=KCVEEVzbPIs"
  },
  {
    "name": "Elevação pélvica unilateral banco",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=IDEZ77rdD2E"
  },
  {
    "name": "Elevacao pélvica unilateral com abdução",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=OgMgWDV276g"
  },
  {
    "name": "Elevação pélvica unilateral solo",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xpdmT6NPmpQ"
  },
  {
    "name": "Elevação y",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LT1bmEr18lA"
  },
  {
    "name": "Elevação y com elástico",
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
    "name": "Estabilização de escápulas no espaldar",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=dqT6Oc22b-A"
  },
  {
    "name": "Extensão de quadril com elástico",
    "muscleGroup": "Outros",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=x4T_3o3tLI0"
  },
  {
    "name": "Extensão de quadril na polia (coice)",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=kvz1Knfhvak"
  },
  {
    "name": "Extensão de quadril na polia perna estendida",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=lrvcVGDQT0M"
  },
  {
    "name": "Extensora bilateral",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=sHIFVwfbcLA"
  },
  {
    "name": "Extensora tronco inclinado",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=WsL3F6GYquw"
  },
  {
    "name": "Extensora unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=YlWMKiYvqlE"
  },
  {
    "name": "Face pull",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=zM43C_-p1EM"
  },
  {
    "name": "Flexão de braço",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": "Apoie as mãos no chão ligeiramente mais abertas que os ombros e flexione os cotovelos até quase tocar o peito.",
    "videoUrl": "https://www.youtube.com/shorts/dTCO9wDonTE"
  },
  {
    "name": "Flexão de braços",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=qVq2_0SBVJs"
  },
  {
    "name": "Flexão de braços ajoelhado",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=hHHx3AqESik"
  },
  {
    "name": "Flexão de joelho em pé caneleira",
    "muscleGroup": "Outros",
    "equipment": "Caneleira",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=RveboRfM0to"
  },
  {
    "name": "Flexão de joelho em pé na polia",
    "muscleGroup": "Outros",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=HNr9TY1p-4c"
  },
  {
    "name": "Flexão de quadril com elástico",
    "muscleGroup": "Outros",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=VWNJhoEzu7Q"
  },
  {
    "name": "Flexão nórdica",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Kwj_NznO7rE"
  },
  {
    "name": "Flexão nórdica reversa",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=IbFv9J4o-gI"
  },
  {
    "name": "Flexão plantar com elástico",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=f85OjocSOrA"
  },
  {
    "name": "Fly inclinado",
    "muscleGroup": "Peito",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ZAOsoTbAk8I"
  },
  {
    "name": "Gêmeos em pé na máquina",
    "muscleGroup": "Panturrilhas",
    "equipment": "Máquina",
    "description": "Apoie os ombros nas almofadas, posicione as pontas dos pés na plataforma e faça a extensão do tornozelo.",
    "videoUrl": "https://www.youtube.com/watch?v=2DXK28kqnfQ"
  },
  {
    "name": "Gêmeos sentado na máquina",
    "muscleGroup": "Panturrilhas",
    "equipment": "Máquina",
    "description": "Sentado na máquina de panturrilha, solte o freio e realize a flexão plantar completa.",
    "videoUrl": "https://www.youtube.com/watch?v=2DXK28kqnfQ"
  },
  {
    "name": "Glúteo 4 apoios perna estendida",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=6I1vXzcf1zw"
  },
  {
    "name": "Glúteo 4 apoios perna flexionada",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xGWthEoq8KQ"
  },
  {
    "name": "Glúteo concha",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=YXvNbClsjA8"
  },
  {
    "name": "Glúteo estendido cruzado",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=yZ49_0xjX8k"
  },
  {
    "name": "Kipping + flexão de braços",
    "muscleGroup": "Cardio",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5ihTyFNWDPw"
  },
  {
    "name": "Landmine press em pé",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=OZedIWKaCTA"
  },
  {
    "name": "Landmine press semi ajoelhado",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5v3RHdurh-M"
  },
  {
    "name": "Leg 180 pés altos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=SNmpBS4robY"
  },
  {
    "name": "Leg 180 pés baixos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=jIfL0U-YEcw"
  },
  {
    "name": "Leg 180 unilateral",
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
    "name": "Leg 45 pés abduzidos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=954tc-olxAk"
  },
  {
    "name": "Leg 45 pés altos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=zl0IoxfuEuU"
  },
  {
    "name": "Leg 45 pés baixos",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Zxx5_Yo-g_0"
  },
  {
    "name": "Leg press 45",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": "Apoie os pés na plataforma na largura dos ombros, empurre e desça flexionando os joelhos até 90 graus.",
    "videoUrl": "https://www.youtube.com/shorts/HITlVV4eXSA"
  },
  {
    "name": "Levantamento sumô",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=VmKJ3gect58"
  },
  {
    "name": "Levantamento terra",
    "muscleGroup": "Costas",
    "equipment": "Barra",
    "description": "Com a barra no chão, suba estendendo o quadril e os joelhos de forma síncrona mantendo o abdômen travado.",
    "videoUrl": "https://www.youtube.com/shorts/k6eZCDVNWco"
  },
  {
    "name": "Levantamento terra barra hexagonal",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eSY_fyndzFM"
  },
  {
    "name": "Liberação na torácica",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=-3mgBUY6UUo"
  },
  {
    "name": "Lift posição de afundo",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=bA37GcoJfgw"
  },
  {
    "name": "Mergulho no banco (tríceps)",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": "Apoie as mãos no banco atrás do corpo e desça o quadril flexionando os cotovelos até 90 graus.",
    "videoUrl": "https://www.youtube.com/shorts/nkhwFKpEhgw"
  },
  {
    "name": "Mesa flexora",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": "Deitado de bruços, flexione os joelhos trazendo os calcanhares em direção ao glúteo.",
    "videoUrl": "https://www.youtube.com/shorts/DYfZ_m-yciE"
  },
  {
    "name": "Mesa flexora unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=DHKPeaW49VM"
  },
  {
    "name": "Mobilidade de tornozelo no caixote",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=UWBaYxrQWjw"
  },
  {
    "name": "Mobilidade de tornozelo semiajoelhado",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=SYFux3PSpmQ"
  },
  {
    "name": "Mobilidade de tornozelo semiajoelhado 2",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=JgxmviF87_M"
  },
  {
    "name": "Mobilidade torácica caixote bastão",
    "muscleGroup": "Mobilidade",
    "equipment": "Outros",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=t5zw3_aPIr4"
  },
  {
    "name": "Mobilidade torácica e de ombro na parede semi ajoelhado",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=RuyhUaHlGw8"
  },
  {
    "name": "Mobilidade torácica gato e camelo",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1H5QPV3JkIw"
  },
  {
    "name": "Mobilidade torácica gato e camelo no caixote",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=46w7IfkqxYk"
  },
  {
    "name": "Mobilidade torácica na parede semi ajoelhado",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5InkVT7Yq4Q"
  },
  {
    "name": "Mobilidade torácica no caixote",
    "muscleGroup": "Mobilidade",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=MQMSS_vE1T4"
  },
  {
    "name": "Panturrilha inclinado joelho elevado à frente",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=kikubfpx8Zw"
  },
  {
    "name": "Panturrilha na barra guiada com step",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=54hhKYNu9d8"
  },
  {
    "name": "Panturrilha na maquina de agachamento",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=F8agcVvigNc"
  },
  {
    "name": "Panturrilha no solo na barra guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5nOaGAnHlxI"
  },
  {
    "name": "Panturrilha no step",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=odFX9wkQKWw"
  },
  {
    "name": "Panturrilha no step unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Step",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wMH4YZDwb7g"
  },
  {
    "name": "Passada caranguejo com movimento",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gCqHpHUP6Ow"
  },
  {
    "name": "Passada caranguejo estático",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=spoN9Rvq5a8"
  },
  {
    "name": "Peck deck (voador)",
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
    "name": "Prancha frontal com elástico e movimentação de pernas",
    "muscleGroup": "Pernas",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ugR56aDVxHM"
  },
  {
    "name": "Prancha isométrica",
    "muscleGroup": "Core",
    "equipment": "Peso Corporal",
    "description": "Apoie os antebraços e as pontas dos pés no chão, mantendo todo o corpo alinhado e o abdômen contraído.",
    "videoUrl": "https://www.youtube.com/shorts/fKkarqjGve8"
  },
  {
    "name": "Prancha lateral com abdução de pernas",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wMZKeIB_AWk"
  },
  {
    "name": "Prancha lateral com glúteo concha",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=X2T25FNVLb0"
  },
  {
    "name": "Pull down com barra reta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=XF7uc-Mz_ZM"
  },
  {
    "name": "Pull down com corda",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=cljclnFIKCo"
  },
  {
    "name": "Pull down com corda sentado",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=N-Ivf7_kfBA"
  },
  {
    "name": "Pulley articulado",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Dhgbx9myv3s"
  },
  {
    "name": "Pulley articulado unilateral",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=C3gltd1a-Ls"
  },
  {
    "name": "Pulley frontal aberto",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=fKhu0pUQ294"
  },
  {
    "name": "Pulley frontal barra anatômica",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=JFdegj1GNcc"
  },
  {
    "name": "Pulley frontal com barra estribo curta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KFPsvhQtqnc"
  },
  {
    "name": "Pulley frontal com triângulo",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=AqVJvaYsi5I"
  },
  {
    "name": "Pulley supinado",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xC1hFQVuZv8"
  },
  {
    "name": "Puxada aberta na polia alta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": "Puxe a barra em direção ao peito inclinando levemente o tronco para trás e esmagando as escápulas.",
    "videoUrl": "https://www.youtube.com/shorts/58l3JzLKhf8"
  },
  {
    "name": "Puxada fechada (triângulo)",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": "Utilizando a manopla de triângulo na polia alta, puxe-a na direção do peito abrindo o peitoral.",
    "videoUrl": "https://www.youtube.com/shorts/3IGToev6BEo"
  },
  {
    "name": "Rdl",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=cm0YHXsOrh0"
  },
  {
    "name": "Rdl unilateral",
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
    "name": "Recuo com step",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=mZC_ItW7NSQ"
  },
  {
    "name": "Recuo na barra guiada",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Rj25-lXI9vo"
  },
  {
    "name": "Recuo no step",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=XS22Tngv8nI"
  },
  {
    "name": "Remada articulada aberta",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=h-glAsX6gqo"
  },
  {
    "name": "Remada articulada aberta unilateral",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=14vSLvxgKVc"
  },
  {
    "name": "Remada articulada fechada",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ItPYxgnQZBM"
  },
  {
    "name": "Remada articulada fechada unilateral",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=VvtgoP5u_Ks"
  },
  {
    "name": "Remada baixa aberta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=oU8VDKR-xIA"
  },
  {
    "name": "Remada baixa barra anatômica",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=suC3mO2NrKk"
  },
  {
    "name": "Remada baixa com barra estribo curta",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ACgU7gH8NYU"
  },
  {
    "name": "Remada baixa com triângulo",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Dq5QoRYbCrs"
  },
  {
    "name": "Remada baixa sentado",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": "Sentado com os pés apoiados, puxe o triângulo em direção ao abdômen mantendo a postura ereta.",
    "videoUrl": "https://www.youtube.com/shorts/na-lNfQQkYk"
  },
  {
    "name": "Remada baixa supinada",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=MMzBG3lUeDo"
  },
  {
    "name": "Remada baixa unilateral",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=sOnXPISYgXg"
  },
  {
    "name": "Remada cavalinho máquina",
    "muscleGroup": "Costas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=sJOQr0mSPFU"
  },
  {
    "name": "Remada cavalinho no suporte",
    "muscleGroup": "Costas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=3YlMCwa5C9A"
  },
  {
    "name": "Remada curvada com barra",
    "muscleGroup": "Costas",
    "equipment": "Barra",
    "description": "Incline o tronco à frente a 45 graus, mantendo a coluna alinhada, e puxe a barra na direção do umbigo.",
    "videoUrl": "https://www.youtube.com/shorts/ZCLySTuhTyg"
  },
  {
    "name": "Remada na polia alta com corda",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ZRMwgEAgfQo"
  },
  {
    "name": "Remada na polia baixa com triângulo",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=BXjBtkNHLf8"
  },
  {
    "name": "Remada na polia baixa supinada",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=pk7mAWFQw7Q"
  },
  {
    "name": "Remada unilateral com halter (serrote)",
    "muscleGroup": "Costas",
    "equipment": "Halteres",
    "description": "Apoiado no banco plano, puxe o halter na lateral do tronco trazendo o cotovelo além da linha das costas.",
    "videoUrl": "https://www.youtube.com/shorts/95WbXV7LKCo"
  },
  {
    "name": "Remada unilateral na polia baixa",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=rSqlQUmiJMg"
  },
  {
    "name": "Remada unilateral polia alta sentado",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=r9Lmo_EX_V8"
  },
  {
    "name": "Retração de escapulas no pulley",
    "muscleGroup": "Costas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=aTwQVcizDsA"
  },{
    "name": "Rosca bíceps 21",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=G0m5jP7C-1A"
  },
  {
    "name": "Rosca bíceps barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=nmY1EM6WI0w"
  },{
    "name": "Rosca bíceps com giro",
    "muscleGroup": "Braços",
    "equipment": "Kettlebell",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=PqShZz6N-xM"
  },
  {
    "name": "Rosca bíceps corda na polia",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=oMTC9Ifm7Vw"
  },
  {
    "name": "Rosca bíceps na polia alta",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KpVkjHSYWvo"
  },
  {
    "name": "Rosca com giro banco 60°",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gxJnGF_pKio"
  },
  {
    "name": "Rosca concentrada",
    "muscleGroup": "Braços",
    "equipment": "Halteres",
    "description": "Sentado com o cotovelo apoiado na parte interna da coxa, realize a rosca isolando o bíceps.",
    "videoUrl": "https://www.youtube.com/shorts/l5b_u4OW2GY"
  },
  {
    "name": "Rosca direta alternada",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=S83rJFTBOp8"
  },
  {
    "name": "Rosca direta banco 60°",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=fCFUtsinDuM"
  },
  {
    "name": "Rosca direta com barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": "Em pé, flexione os cotovelos trazendo a barra na direção dos ombros sem mover os braços para frente.",
    "videoUrl": "https://www.youtube.com/watch?v=35BxIpDbLD8"
  },
  {
    "name": "Rosca direta com desenvolvimento",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=vIDHNQrK3Tg"
  },
  {
    "name": "Rosca direta com halteres",
    "muscleGroup": "Braços",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=jTYbykP91vI"
  },
  {
    "name": "Rosca direta na polia barra reta",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=_dC7hRgeR9Y"
  },
  {
    "name": "Rosca direta no aparelho funcional",
    "muscleGroup": "Braços",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=NJdoqVW4Yzs"
  },
  {
    "name": "Rosca direta pegada pronada",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=CafXdOgww4I"
  },
  {
    "name": "Rosca martelo alternada",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=yqYdPpXrCAA"
  },
  {
    "name": "Rosca martelo banco 60°",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wlISRIeP8tg"
  },
  {
    "name": "Rosca martelo barra h",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gocf3-nePpI"
  },
  {
    "name": "Rosca martelo com elástico",
    "muscleGroup": "Braços",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LW7EC4a4Tow"
  },
  {
    "name": "Rosca martelo com halteres",
    "muscleGroup": "Braços",
    "equipment": "Halteres",
    "description": "Com pegada neutra (palmas para dentro), faça a flexão de cotovelos de forma alternada ou simultânea.",
    "videoUrl": "https://www.youtube.com/shorts/BH4RDHryDbU"
  },
  {
    "name": "Rosca martelo no scott unilateral",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=_-pecjXwuEU"
  },
  {
    "name": "Rosca punho antebraço",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=w0ZSoP9QivE"
  },
  {
    "name": "Rosca scott barra h",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=pECq6xDL5jk"
  },
  {
    "name": "Rosca scott barra reta",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=cdo1wAOnBZ0"
  },
  {
    "name": "Rosca scott barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=kzgkkHKty1I"
  },
  {
    "name": "Rosca spider",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gYr2VIIobcw"
  },
  {
    "name": "Rosca unilateral na polia",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=AjP7irEtB-A"
  },
  {
    "name": "Rotação externa bilateral halter decúbito dorsal",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=hD-63xfepcM"
  },
  {
    "name": "Rotação externa com barra unilateral",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=2FxJzyhh6Yw"
  },
  {
    "name": "Rotação externa na parede",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=CsuweSHZMFc"
  },
  {
    "name": "Rotação externa unilateral com elástico",
    "muscleGroup": "Ombros",
    "equipment": "Elástico",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=zBwRcnj-PNE"
  },
  {
    "name": "Salto de corda",
    "muscleGroup": "Cardio",
    "equipment": "Outros",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=i4gMHCk5sKY"
  },
  {
    "name": "Salto no caixote",
    "muscleGroup": "Cardio",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=6_5F_FiB5Uk"
  },
  {
    "name": "Seated leg press",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9e-Plzvvj3E"
  },
  {
    "name": "Sentar e levantar",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=OYAzBGS7xIw"
  },
  {
    "name": "Snatch alternado",
    "muscleGroup": "Ombros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=KA0lSCTI06I"
  },
  {
    "name": "Snatch landmine",
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
    "name": "Stiff abduzido",
    "muscleGroup": "Pernas",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=FMHw-exGgxI"
  },
  {
    "name": "Stiff com halteres",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": "Flexione levemente os joelhos e desça os halteres rente às pernas, empurrando o quadril para trás.",
    "videoUrl": "https://www.youtube.com/shorts/Z4aQruKglOM"
  },
  {
    "name": "Stiff na máquina",
    "muscleGroup": "Pernas",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=GSWxaUuc36I"
  },
  {
    "name": "Stiff na polia",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=2oJkwwqg9XU"
  },
  {
    "name": "Stiff reverso",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=HqaBUet26_w"
  },
  {
    "name": "Stiff unilateral",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xpLsFO1Zhz0"
  },
  {
    "name": "Subida no caixote",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ra3RcUYVwZ8"
  },
  {
    "name": "Subida no caixote over burpeer",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=eDR0doEfVFE"
  },
  {
    "name": "Subida no caixote over sprawls",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=6SXL6T79A2U"
  },
  {
    "name": "Subida no caixote perna estática",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=DiSFfxUlh4w"
  },
  {
    "name": "Supino inclinado barra guiada",
    "muscleGroup": "Peito",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=8wyfA27ORKo"
  },
  {
    "name": "Supino inclinado com barra",
    "muscleGroup": "Peito",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=1Y7MQ2IGvFk"
  },
  {
    "name": "Supino inclinado com halteres",
    "muscleGroup": "Peito",
    "equipment": "Halteres",
    "description": "Sentado em banco inclinado a 30-45 graus, empurre os halteres para cima de forma controlada.",
    "videoUrl": "https://www.youtube.com/watch?v=L5mYF7tfl4A"
  },
  {
    "name": "Supino inclinado máquina funcional",
    "muscleGroup": "Peito",
    "equipment": "Máquina",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=CStHJSJFAFY"
  },
  {
    "name": "Supino reto barra guiada",
    "muscleGroup": "Peito",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=9uR1ykwA8EY"
  },
  {
    "name": "Supino reto com barra",
    "muscleGroup": "Peito",
    "equipment": "Barra",
    "description": "Deitado no banco plano, desça a barra até tocar levemente o peito e empurre-a de volta para a posição inicial.",
    "videoUrl": "https://www.youtube.com/shorts/ZL-sw4fqkE4"
  },
  {
    "name": "Supino reto com halteres",
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
    "name": "Thruster com halter",
    "muscleGroup": "Outros",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Ik57T5PQxj0"
  },
  {
    "name": "Thruster ladmine",
    "muscleGroup": "Ombros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=VFj04eGoyZY"
  },
  {
    "name": "Thruster landmine",
    "muscleGroup": "Ombros",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=8nTbHpIZTcQ"
  },
  {
    "name": "Tibial anterior",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=I8EG9Zz2ynI"
  },
  {
    "name": "Tibial anterior na parede",
    "muscleGroup": "Pernas",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=RFHshgcWjs8"
  },
  {
    "name": "Touch down",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=GxeaOzYEo1Y"
  },
  {
    "name": "Tríceps arremesso barra reta",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=98toqd2XkCE"
  },
  {
    "name": "Tríceps arremesso barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=5SAL8hTOfPM"
  },
  {
    "name": "Tríceps arremesso corda",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gz8T2thf3BI"
  },
  {
    "name": "Tríceps arremesso pronado",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=am6WQW0iwc8"
  },
  {
    "name": "Tríceps arremesso unilateral com corda",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=LtoxYz8yEtM"
  },
  {
    "name": "Tríceps coice com corda",
    "muscleGroup": "Pernas",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=N5QDpZ5m_Vo"
  },
  {
    "name": "Tríceps coice com halter",
    "muscleGroup": "Pernas",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=i2vsWh6Hiq0"
  },
  {
    "name": "Tríceps corda",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=2Xo32BKyTVk"
  },
  {
    "name": "Tríceps francês",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Sa1Go2jK4cY"
  },
  {
    "name": "Tríceps francês com halter",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=gTF-0imbH1g"
  },
  {
    "name": "Tríceps francês unilateral",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=vGbZLj1l5EM"
  },
  {
    "name": "Tríceps inverso",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=nc9btW9-7oo"
  },
  {
    "name": "Tríceps martelo unilateral",
    "muscleGroup": "Braços",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=sUZvir4UKvo"
  },
  {
    "name": "Tríceps na polia barra reta",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=oWDmzZAh5t0"
  },
  {
    "name": "Tríceps na polia barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=FhOlDndu_Fs"
  },
  {
    "name": "Tríceps pulley (corda)",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": "Segure a corda na polia alta e faça a extensão completa dos cotovelos, abrindo a corda no final.",
    "videoUrl": "https://www.youtube.com/shorts/nkhwFKpEhgw"
  },
  {
    "name": "Tríceps testa barra h",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=xLQkiwFcvQM"
  },
  {
    "name": "Tríceps testa barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=wKDgqNrESIE"
  },
  {
    "name": "Tríceps testa barra W inclinado",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=ZVEUdGPYQDs"
  },
  {
    "name": "Tríceps testa com barra W",
    "muscleGroup": "Braços",
    "equipment": "Barra",
    "description": "Deitado, segure a barra acima do peito e flexione os cotovelos trazendo a barra na direção da testa.",
    "videoUrl": "https://www.youtube.com/shorts/x9lbdH8qbHM"
  },
  {
    "name": "Tríceps testa com halter",
    "muscleGroup": "Braços",
    "equipment": "Halteres",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=7Lb3Z1Wvsuo"
  },
  {
    "name": "Tríceps testa na polia baixa",
    "muscleGroup": "Braços",
    "equipment": "Polia",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=358kK-VQNBE"
  },
  {
    "name": "Tríceps unilateral supinado",
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
    "name": "Wall ball",
    "muscleGroup": "Outros",
    "equipment": "Peso Corporal",
    "description": null,
    "videoUrl": "https://www.youtube.com/watch?v=Q3pj-DRsiQQ"
  },
  {
    "name": "Wall drill",
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
