const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allExercises = await prisma.exercise.findMany();
  console.log("Total exercises in DB:", allExercises.length);
  
  const withGif = allExercises.filter(ex => ex.gifUrl);
  console.log("Exercises with GIFUrl:", withGif.length);
  
  const withVideoOnly = allExercises.filter(ex => ex.videoUrl && !ex.gifUrl);
  console.log("Exercises with videoUrl only (no GIF):", withVideoOnly.length);
  
  console.log("\nSample of exercises with videoUrl only:");
  withVideoOnly.slice(0, 15).forEach(ex => {
    console.log(`- [${ex.id}] ${ex.name} (Muscle: ${ex.muscleGroup}, Equipment: ${ex.equipment})`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
