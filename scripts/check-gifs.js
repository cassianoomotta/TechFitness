const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exercises = await prisma.exercise.findMany({
    where: {
      gifUrl: { not: null }
    },
    select: {
      name: true,
      gifUrl: true
    },
    take: 10
  });
  console.log("Exercises with gifUrl:", exercises);
  
  const nullGifs = await prisma.exercise.count({
    where: {
      gifUrl: null
    }
  });
  console.log(`Exercises with NULL gifUrl: ${nullGifs}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
