const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function fixCapitalization(name) {
  // Converte para minúsculas e remove espaços extras
  let cleanName = name.toLowerCase().trim();
  
  // Coloca a primeira letra em maiúscula
  if (cleanName.length > 0) {
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }
  
  // Exceções para manter siglas e nomes próprios corretos
  cleanName = cleanName.replace(/\brdl\b/g, "RDL");
  cleanName = cleanName.replace(/\bsmith\b/g, "Smith");
  cleanName = cleanName.replace(/\bpallof\b/g, "Pallof");
  cleanName = cleanName.replace(/\by\b/g, "Y");
  
  return cleanName;
}

async function main() {
  console.log("Iniciando correção de capitalização e nomenclatura...");
  
  const exercises = await prisma.exercise.findMany();
  let updatedCount = 0;
  
  for (const ex of exercises) {
    let newName = fixCapitalization(ex.name);
    let newMuscleGroup = ex.muscleGroup;
    
    // Corrigindo também "Mobilidade" para "Aquecimento e Mobilidade" se foi pedido antes
    if (newMuscleGroup === "Mobilidade") {
      newMuscleGroup = "Aquecimento e Mobilidade";
    }
    
    if (newName !== ex.name || newMuscleGroup !== ex.muscleGroup) {
      try {
        await prisma.exercise.update({
          where: { id: ex.id },
          data: { 
            name: newName,
            muscleGroup: newMuscleGroup
          }
        });
        updatedCount++;
      } catch (err) {
        if (err.code === 'P2002') {
          console.log(`Duplicata encontrada para: ${newName}. Deletando a versão sobressalente (ID: ${ex.id}).`);
          await prisma.exercise.delete({ where: { id: ex.id } });
        } else {
          throw err;
        }
      }
    }
  }
  
  console.log(`Correção concluída. ${updatedCount} exercícios foram atualizados.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
