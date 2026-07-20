const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fixMap = {
  'Stiff na barra guiada': 'videos/0752-UfePqpx.gif', // smith deadlift (closest to stiff na barra guiada)
  'Stiff': 'videos/0752-UfePqpx.gif', // also update base Stiff just in case (or band stiff leg deadlift which is 1009)
  'Pulley frontal com triângulo': 'videos/2616-4c9BhzB.gif', // cable lateral pulldown with v-bar
  'Face pull': 'videos/0177-CuaWCmC.gif' // cable rear delt row (with rope) - exact face pull equivalent
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
