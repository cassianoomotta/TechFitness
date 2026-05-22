const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Batch 2: videos 101-200 from playlist
const batch2 = [
  { name: "Snatch Landmine", url: "https://www.youtube.com/watch?v=7HIkxErc7iI", mg: "Ombros", eq: "Barra" },
  { name: "Seated Leg Press", url: "https://www.youtube.com/watch?v=9e-Plzvvj3E", mg: "Pernas", eq: "Máquina" },
  { name: "Stiff Abduzido", url: "https://www.youtube.com/watch?v=FMHw-exGgxI", mg: "Pernas", eq: "Barra" },
  { name: "Stiff na Máquina", url: "https://www.youtube.com/watch?v=GSWxaUuc36I", mg: "Pernas", eq: "Máquina" },
  { name: "Snatch Alternado", url: "https://www.youtube.com/watch?v=KA0lSCTI06I", mg: "Ombros", eq: "Halteres" },
  { name: "Sentar e Levantar", url: "https://www.youtube.com/watch?v=OYAzBGS7xIw", mg: "Pernas", eq: "Peso Corporal" },
  { name: "Salto de Corda", url: "https://www.youtube.com/watch?v=i4gMHCk5sKY", mg: "Cardio", eq: "Outros" },
  { name: "Rotação Externa Unilateral com Elástico", url: "https://www.youtube.com/watch?v=zBwRcnj-PNE", mg: "Ombros", eq: "Elástico" },
  { name: "Rotação Externa com Barra Unilateral", url: "https://www.youtube.com/watch?v=2FxJzyhh6Yw", mg: "Ombros", eq: "Barra" },
  { name: "Remada na Polia Baixa com Triângulo", url: "https://www.youtube.com/watch?v=BXjBtkNHLf8", mg: "Costas", eq: "Polia" },
  { name: "Rotação Externa na Parede", url: "https://www.youtube.com/watch?v=CsuweSHZMFc", mg: "Ombros", eq: "Peso Corporal" },
  { name: "Remada Baixa Supinada", url: "https://www.youtube.com/watch?v=MMzBG3lUeDo", mg: "Costas", eq: "Polia" },
  { name: "Remada na Polia Alta com Corda", url: "https://www.youtube.com/watch?v=ZRMwgEAgfQo", mg: "Costas", eq: "Polia" },
  { name: "Rotação Externa Bilateral Halter Decúbito Dorsal", url: "https://www.youtube.com/watch?v=hD-63xfepcM", mg: "Ombros", eq: "Halteres" },
  { name: "Remada na Polia Baixa Supinada", url: "https://www.youtube.com/watch?v=pk7mAWFQw7Q", mg: "Costas", eq: "Polia" },
  { name: "Remada Unilateral Polia Alta Sentado", url: "https://www.youtube.com/watch?v=r9Lmo_EX_V8", mg: "Costas", eq: "Polia" },
  { name: "Remada Unilateral na Polia Baixa", url: "https://www.youtube.com/watch?v=rSqlQUmiJMg", mg: "Costas", eq: "Polia" },
  { name: "Remada Baixa Unilateral", url: "https://www.youtube.com/watch?v=sOnXPISYgXg", mg: "Costas", eq: "Polia" },
  { name: "Remada Articulada Aberta Unilateral", url: "https://www.youtube.com/watch?v=14vSLvxgKVc", mg: "Costas", eq: "Máquina" },
  { name: "Remada Baixa com Barra Estribo Curta", url: "https://www.youtube.com/watch?v=ACgU7gH8NYU", mg: "Costas", eq: "Polia" },
  { name: "Remada Baixa com Triângulo", url: "https://www.youtube.com/watch?v=Dq5QoRYbCrs", mg: "Costas", eq: "Polia" },
  { name: "Remada Articulada Fechada", url: "https://www.youtube.com/watch?v=ItPYxgnQZBM", mg: "Costas", eq: "Máquina" },
  { name: "Recuo", url: "https://www.youtube.com/watch?v=NcFqOJqZ_GA", mg: "Pernas", eq: "Peso Corporal" },
  { name: "Remada Articulada Fechada Unilateral", url: "https://www.youtube.com/watch?v=VvtgoP5u_Ks", mg: "Costas", eq: "Máquina" },
  { name: "Recuo no Step", url: "https://www.youtube.com/watch?v=XS22Tngv8nI", mg: "Pernas", eq: "Peso Corporal" },
  { name: "Remada Articulada Aberta", url: "https://www.youtube.com/watch?v=h-glAsX6gqo", mg: "Costas", eq: "Máquina" },
  { name: "Remada Baixa Aberta", url: "https://www.youtube.com/watch?v=oU8VDKR-xIA", mg: "Costas", eq: "Polia" },
  { name: "Remada Baixa Barra Anatômica", url: "https://www.youtube.com/watch?v=suC3mO2NrKk", mg: "Costas", eq: "Polia" },
  { name: "Pulley Frontal com Triângulo", url: "https://www.youtube.com/watch?v=AqVJvaYsi5I", mg: "Costas", eq: "Polia" },
  { name: "Pulley Articulado", url: "https://www.youtube.com/watch?v=Dhgbx9myv3s", mg: "Costas", eq: "Máquina" },
  { name: "Pulley Frontal Barra Anatômica", url: "https://www.youtube.com/watch?v=JFdegj1GNcc", mg: "Costas", eq: "Polia" },
  { name: "Pulley Frontal com Barra Estribo Curta", url: "https://www.youtube.com/watch?v=KFPsvhQtqnc", mg: "Costas", eq: "Polia" },
  { name: "RDL Unilateral", url: "https://www.youtube.com/watch?v=O6rl-6JQnxM", mg: "Pernas", eq: "Halteres" },
  { name: "Recuo na Barra Guiada", url: "https://www.youtube.com/watch?v=Rj25-lXI9vo", mg: "Pernas", eq: "Barra" },
  { name: "RDL", url: "https://www.youtube.com/watch?v=cm0YHXsOrh0", mg: "Pernas", eq: "Barra" },
  { name: "Pulley Frontal Aberto", url: "https://www.youtube.com/watch?v=fKhu0pUQ294", mg: "Costas", eq: "Polia" },
  { name: "Recuo com Step", url: "https://www.youtube.com/watch?v=mZC_ItW7NSQ", mg: "Pernas", eq: "Peso Corporal" },
  { name: "Pulley Supinado", url: "https://www.youtube.com/watch?v=xC1hFQVuZv8", mg: "Costas", eq: "Polia" },
  { name: "Mobilidade Torácica Gato e Camelo no Caixote", url: "https://www.youtube.com/watch?v=46w7IfkqxYk", mg: "Mobilidade", eq: "Peso Corporal" },
  { name: "Pulley Articulado Unilateral", url: "https://www.youtube.com/watch?v=C3gltd1a-Ls", mg: "Costas", eq: "Máquina" },
  { name: "Mobilidade Torácica no Caixote", url: "https://www.youtube.com/watch?v=MQMSS_vE1T4", mg: "Mobilidade", eq: "Peso Corporal" },
  { name: "Pull Down com Corda Sentado", url: "https://www.youtube.com/watch?v=N-Ivf7_kfBA", mg: "Costas", eq: "Polia" },
  { name: "Polichinelo", url: "https://www.youtube.com/watch?v=RQlKDwSw7gg", mg: "Cardio", eq: "Peso Corporal" },
  { name: "Mobilidade de Tornozelo Semiajoelhado", url: "https://www.youtube.com/watch?v=SYFux3PSpmQ", mg: "Mobilidade", eq: "Peso Corporal" },
  { name: "Mobilidade de Tornozelo no Caixote", url: "https://www.youtube.com/watch?v=UWBaYxrQWjw", mg: "Mobilidade", eq: "Peso Corporal" },
  { name: "Pull Down com Barra Reta", url: "https://www.youtube.com/watch?v=XF7uc-Mz_ZM", mg: "Costas", eq: "Polia" },
  { name: "Pull Down com Corda", url: "https://www.youtube.com/watch?v=cljclnFIKCo", mg: "Costas", eq: "Polia" },
  { name: "Mobilidade Torácica Caixote Bastão", url: "https://www.youtube.com/watch?v=t5zw3_aPIr4", mg: "Mobilidade", eq: "Outros" },
  { name: "Mobilidade Torácica Gato e Camelo", url: "https://www.youtube.com/watch?v=1H5QPV3JkIw", mg: "Mobilidade", eq: "Peso Corporal" },
  { name: "Mobilidade de Tornozelo Semiajoelhado 2", url: "https://www.youtube.com/watch?v=JgxmviF87_M", mg: "Mobilidade", eq: "Peso Corporal" },
];

async function main() {
  console.log(`Inserting batch 2: ${batch2.length} exercises...`);
  let count = 0;
  for (const ex of batch2) {
    try {
      await prisma.exercise.create({
        data: { name: ex.name, muscleGroup: ex.mg, equipment: ex.eq, videoUrl: ex.url }
      });
      count++;
    } catch (e) {
      console.log(`Skip (duplicate): ${ex.name}`);
    }
  }
  console.log(`Done! ${count} new exercises added.`);
  const total = await prisma.exercise.count();
  console.log(`Total exercises in DB: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
