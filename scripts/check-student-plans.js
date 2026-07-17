const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.workoutPlan.findMany({
    include: {
      student: {
        include: {
          user: true
        }
      },
      exercises: {
        include: {
          exercise: true
        }
      }
    }
  });

  console.log(`Total workout plans found: ${plans.length}`);

  for (const plan of plans) {
    console.log(`\nPlan: "${plan.name}" (ID: ${plan.id}) for Student: "${plan.student.user.name || plan.student.user.email}"`);
    for (const pe of plan.exercises) {
      console.log(`  - Exercise: "${pe.exercise.name}" (ID: ${pe.exercise.id})`);
      console.log(`    gifUrl: "${pe.exercise.gifUrl}"`);
      console.log(`    videoUrl: "${pe.exercise.videoUrl}"`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
