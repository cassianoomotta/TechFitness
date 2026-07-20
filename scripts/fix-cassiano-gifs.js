const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fixMap = {
  'Agachamento na barra guiada': 'videos/0770-jFtipLl.gif', // smith squat
  'Leg press 45': 'videos/0739-10Z2DXU.gif', // sled 45 leg press
  'Mesa flexora': 'videos/0586-17lJ1kr.gif', // lever lying leg curl
  'Cadeira extensora': 'videos/0585-my33uHU.gif', // lever leg extension
  'Afundo com halteres': 'videos/0336-RRWFUcw.gif', // dumbbell lunge
  'Panturrilha na barra guiada com step': 'videos/0773-6MaEjVA.gif', // smith standing leg calf raise
  'Gêmeos sentado na máquina': 'videos/0594-bOOdeyc.gif', // lever seated calf raise
  'Stiff': 'videos/1009-kuMiR2T.gif', // smith stiff leg deadlift / barbell stiff leg deadlift
  'Pulley frontal com triângulo': 'videos/0198-RVwzP10.gif', // cable pulldown
  'Remada baixa com triângulo': 'videos/0861-fUBheHs.gif', // cable seated row
  'Remada cavalinho máquina': 'videos/1350-7I6LNUG.gif', // lever seated row
  'Face pull': 'videos/0187-sAOSN5g.gif', // cable rear delt row (close enough to face pull if no face pull)
  'Remada unilateral polia alta sentado': 'videos/0214-vpp9Ku2.gif', // cable seated one arm alternate row
  'Rosca bíceps barra W': 'videos/0447-6TG6x2w.gif', // ez barbell curl
  'Rosca spider': 'videos/0454-Ye5Qxb0.gif',
  'Rosca martelo com halteres': 'videos/0313-slDvUAU.gif',
  'Supino reto com barra': 'videos/0025-EIeI8Vf.gif',
  'Cross over': 'videos/0153-OQ1otBN.gif',
  'Supino inclinado com halteres': 'videos/0314-ns0SIbU.gif',
  'Peck deck (voador)': 'videos/1262-w4dLzSx.gif', // actually it's lever peck deck fly
  'Tríceps testa com halter': 'videos/0351-mpKZGWz.gif',
  'Tríceps na polia barra W': 'videos/0241-gAwDzB3.gif',
  'Tríceps francês unilateral': 'videos/0430-PdmaD0N.gif',
  'Manguito rotador (Rotação externa na polia)': 'videos/0235-FWdVhcW.gif',
  'Elevação lateral com halteres': 'videos/0334-DsgkuIt.gif',
  'Desenvolvimento com halteres': 'videos/0405-znQUdHY.gif',
  'Crucifixo inverso no cross': 'videos/0225-P5p0j8B.gif',
  'Elevação lateral na polia unilateral': 'videos/0192-wEulIzp.gif',
  'Voador inverso': 'videos/0602-myfUsKf.gif',
  'Encolhimento no cross': 'videos/0220-Eg98Ft9.gif',
  'Elevação frontal com triângulo sentado no cross': 'videos/0166-nK5z5Vn.gif' // cable seated front raise
};

async function main() {
  for (const [name, gifUrl] of Object.entries(fixMap)) {
    const ex = await prisma.exercise.findFirst({ where: { name } });
    if (ex) {
      await prisma.exercise.update({
        where: { id: ex.id },
        data: { gifUrl }
      });
      console.log(`Updated ${name} to ${gifUrl}`);
    } else {
      console.log(`Not found: ${name}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
