const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const exercises = await prisma.exercise.findMany({
    where: {
      name: {
        contains: "Abdominal Canivete",
        mode: "insensitive"
      }
    }
  });
  console.log("Exercícios encontrados:");
  console.log(JSON.stringify(exercises, null, 2));
}

main().finally(() => prisma.$disconnect());
