const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando limpeza do banco de dados...");
  
  // Deletar na ordem das restrições de chave estrangeira
  const deletedLogs = await prisma.exerciseLog.deleteMany({});
  console.log(`Deletados ${deletedLogs.count} logs de exercício.`);

  const deletedSessions = await prisma.workoutSession.deleteMany({});
  console.log(`Deletadas ${deletedSessions.count} sessões de treino.`);

  const deletedMeasurements = await prisma.bodyMeasurement.deleteMany({});
  console.log(`Deletadas ${deletedMeasurements.count} medições corporais.`);

  const deletedPlanExercises = await prisma.workoutPlanExercise.deleteMany({});
  console.log(`Deletados ${deletedPlanExercises.count} exercícios de planos.`);

  const deletedPlans = await prisma.workoutPlan.deleteMany({});
  console.log(`Deletados ${deletedPlans.count} planos de treino.`);

  const deletedTemplates = await prisma.workoutTemplate.deleteMany({});
  console.log(`Deletados ${deletedTemplates.count} templates.`);

  const deletedStudents = await prisma.studentProfile.deleteMany({});
  console.log(`Deletados ${deletedStudents.count} perfis de aluno.`);

  const deletedTrainers = await prisma.trainerProfile.deleteMany({});
  console.log(`Deletados ${deletedTrainers.count} perfis de treinador.`);

  const deletedExercises = await prisma.exercise.deleteMany({});
  console.log(`Deletados ${deletedExercises.count} exercícios da biblioteca.`);

  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`Deletados ${deletedUsers.count} usuários.`);

  console.log("Banco de dados completamente zerado!");
}

main()
  .catch((e) => {
    console.error("Erro ao limpar o banco de dados:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
