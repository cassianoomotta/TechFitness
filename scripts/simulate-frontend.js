// Simulate exactly what the API returns, to verify the data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'cassiano@gmail.com' } });
  const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
  
  // Get first plan
  const plans = await prisma.workoutPlan.findMany({
    where: { studentId: studentProfile.id },
    include: {
      exercises: {
        orderBy: { order: 'asc' },
        include: {
          exercise: {
            select: { id: true, name: true, muscleGroup: true, equipment: true, description: true, videoUrl: true, gifUrl: true }
          }
        }
      }
    },
    take: 1
  });

  const plan = plans[0];
  
  // Simulate the API mapping (exactly from /api/student/workout-plans/[id]/route.ts)
  const formattedExercises = plan.exercises.map(pe => ({
    id: pe.id,
    exerciseId: pe.exercise.id,
    name: pe.customName || pe.exercise.name,
    customName: pe.customName,
    muscleGroup: pe.exercise.muscleGroup,
    equipment: pe.exercise.equipment,
    description: pe.exercise.description,
    videoUrl: pe.exercise.videoUrl,
    gifUrl: pe.exercise.gifUrl,
    sets: pe.sets,
    reps: pe.reps,
  }));

  console.log(`Plan: ${plan.name}`);
  console.log('\nFormatted exercises (as API returns):');
  
  for (const ex of formattedExercises) {
    console.log(`\n  ${ex.name}:`);
    console.log(`    videoUrl = ${JSON.stringify(ex.videoUrl)}`);
    console.log(`    gifUrl   = ${JSON.stringify(ex.gifUrl)}`);
    
    // Simulate the frontend logic: exercise.gifUrl || exercise.videoUrl || ""
    const activeVideoUrl = ex.gifUrl || ex.videoUrl || "";
    console.log(`    -> setActiveVideoUrl would get: ${JSON.stringify(activeVideoUrl)}`);
    
    // Simulate the modal rendering logic
    if (activeVideoUrl.endsWith('.gif')) {
      console.log(`    -> WOULD RENDER: <img> (GIF) ✅`);
    } else if (activeVideoUrl.includes('youtube.com') || activeVideoUrl.includes('youtu.be')) {
      console.log(`    -> WOULD RENDER: <iframe> (YouTube) ⚠️`);
    } else {
      console.log(`    -> WOULD RENDER: <video> tag`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
