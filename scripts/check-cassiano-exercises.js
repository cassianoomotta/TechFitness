const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Buscar perfil do aluno Cassiano
  const user = await prisma.user.findUnique({
    where: { email: 'cassiano@gmail.com' }
  });
  if (!user) { console.log('User not found'); return; }
  
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId: user.id }
  });
  if (!studentProfile) { console.log('Student profile not found'); return; }
  
  console.log(`Student Profile ID: ${studentProfile.id}`);
  
  // Buscar planos de treino
  const plans = await prisma.workoutPlan.findMany({
    where: { studentId: studentProfile.id },
    include: {
      exercises: {
        include: {
          exercise: {
            select: { id: true, name: true, videoUrl: true, gifUrl: true }
          }
        }
      }
    }
  });
  
  console.log(`\nTotal plans: ${plans.length}\n`);
  
  for (const plan of plans) {
    console.log(`=== Plan: ${plan.name} (${plan.division}) ===`);
    for (const pe of plan.exercises) {
      const ex = pe.exercise;
      const gifStatus = ex.gifUrl ? `✅ GIF: ${ex.gifUrl}` : '❌ NO GIF';
      const videoStatus = ex.videoUrl ? `🎬 Video: ${ex.videoUrl.substring(0, 50)}...` : 'No video';
      console.log(`  - ${pe.customName || ex.name} | ${gifStatus} | ${videoStatus}`);
    }
    console.log('');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
