const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fixMap = {
  'Stiff': 'videos/0116-hrVQWvE.gif', // barbell straight leg deadlift (perfect stiff legs)
  'Face pull': 'videos/0233-ZfyAGhK.gif', // cable standing rear delt row (with rope) - true face pull
  'Pulley frontal com triângulo': 'videos/0213-pwt0pnM.gif', // cable seated high row (v-bar)
  'Remada unilateral polia alta sentado': 'videos/0214-vpp9Ku2.gif' // cable seated one arm alternate row
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
