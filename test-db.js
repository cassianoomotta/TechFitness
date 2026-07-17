const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const totalWithGif = await prisma.exercise.count({
    where: { gifUrl: { not: null } }
  });
  console.log("Total exercises in DB with GIF:", totalWithGif);

  const planExercises = await prisma.workoutPlanExercise.findMany({
    include: { exercise: true },
    take: 5
  });
  console.log("WorkoutPlanExercises sample:");
  planExercises.forEach(pe => {
    console.log(`- PE ID: ${pe.id}, Name: ${pe.customName || pe.exercise.name}, Ex Name: ${pe.exercise.name}, Ex GIF: ${pe.exercise.gifUrl}, Ex Video: ${pe.exercise.videoUrl}`);
  });
}
main().catch(e => console.error(e)).finally(async () => { await prisma.$disconnect(); });
