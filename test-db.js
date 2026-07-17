const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const exercises = await prisma.exercise.findMany({
    take: 5,
    where: { gifUrl: { not: null } }
  });
  console.log("Com GIF:", exercises);
  
  const exerciciosSemGif = await prisma.exercise.findMany({
    take: 5,
    where: { gifUrl: null }
  });
  console.log("Sem GIF:", exerciciosSemGif);
}
main().catch(e => console.error(e)).finally(async () => { await prisma.$disconnect(); });
