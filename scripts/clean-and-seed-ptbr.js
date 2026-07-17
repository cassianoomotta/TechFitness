const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("=== TECHFITNESS DB CLEANUP & SEEDING TRANSLATED EXERCISES ===");

  // 1. Carregar arquivos de suporte
  const backupPath = path.join(__dirname, '..', 'backup_exercicios_originais_2026-07-17_13-54.json');
  const mappedGifsPath = path.join(__dirname, '..', 'prisma', 'seeds', 'mapped_core_gifs.json');
  const rawPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_raw.json');
  const ptbrPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_ptbr.json');

  if (!fs.existsSync(backupPath)) {
    console.error("❌ Arquivo de backup não encontrado em " + backupPath);
    return;
  }
  if (!fs.existsSync(mappedGifsPath)) {
    console.error("❌ Arquivo mapped_core_gifs.json não encontrado em " + mappedGifsPath);
    return;
  }
  if (!fs.existsSync(rawPath)) {
    console.error("❌ Arquivo exercises_raw.json não encontrado em " + rawPath);
    return;
  }
  if (!fs.existsSync(ptbrPath)) {
    console.error("❌ Arquivo exercises_ptbr.json não encontrado em " + ptbrPath);
    return;
  }

  const backupExercises = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const mappedGifs = JSON.parse(fs.readFileSync(mappedGifsPath, 'utf8'));
  const rawExercises = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const ptbrExercises = JSON.parse(fs.readFileSync(ptbrPath, 'utf8'));

  const coreIds = new Set(backupExercises.map(ex => ex.id));
  console.log(`Carregados ${backupExercises.length} exercícios core da biblioteca original.`);

  // Identificar o exercício em inglês referenciado em logs/treinos
  const referencedEnglishId = "cmrp7kl6b0090tjfwm0neczu3"; // "3/4 sit-up"

  // 2. Limpar os exercícios em inglês que não estão sendo utilizados
  console.log("Limpando exercícios em inglês não referenciados...");
  const dbExercises = await prisma.exercise.findMany({
    select: { id: true, name: true }
  });

  const idsToDelete = [];
  dbExercises.forEach(ex => {
    if (!coreIds.has(ex.id) && ex.id !== referencedEnglishId) {
      idsToDelete.push(ex.id);
    }
  });

  console.log(`Deletando ${idsToDelete.length} exercícios não utilizados do banco de dados...`);
  if (idsToDelete.length > 0) {
    const deleteResult = await prisma.exercise.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });
    console.log(`Deletados ${deleteResult.count} exercícios com sucesso.`);
  }

  // 3. Renomear o exercício de ID "cmrp7kl6b0090tjfwm0neczu3" de "3/4 sit-up" para "Abdominal 3/4"
  console.log("Renomeando o exercício em inglês referenciado...");
  const refExercise = await prisma.exercise.findUnique({
    where: { id: referencedEnglishId }
  });

  if (refExercise) {
    await prisma.exercise.update({
      where: { id: referencedEnglishId },
      data: {
        name: "Abdominal 3/4",
        muscleGroup: "Core",
        equipment: "Peso Corporal",
        gifUrl: "videos/0001-2gPfomN.gif" // GIF do 3/4 sit-up
      }
    });
    console.log(`Exercício ${referencedEnglishId} renomeado com sucesso para 'Abdominal 3/4'.`);
  } else {
    console.log("⚠️ Exercício referenciado não encontrado no banco.");
  }

  // 4. Restaurar/Atualizar a biblioteca original (340 exercícios)
  // Isso garante que todos os IDs originais e nomes originais continuem idênticos
  console.log("Garantindo integridade dos 340 exercícios core originais...");
  
  // Criar um mapeamento rápido dos GIFs das correspondências
  const gifMap = new Map(); // id do exercicio core -> gifUrl
  mappedGifs.forEach(mg => {
    if (mg.gifUrl) {
      gifMap.set(mg.id, mg.gifUrl);
    }
  });

  for (const origEx of backupExercises) {
    const existing = await prisma.exercise.findUnique({
      where: { id: origEx.id }
    });

    const finalGifUrl = gifMap.get(origEx.id) || origEx.gifUrl || null;

    if (existing) {
      // Atualiza mantendo os dados originais e injetando o GIF
      await prisma.exercise.update({
        where: { id: origEx.id },
        data: {
          name: origEx.name,
          muscleGroup: origEx.muscleGroup,
          equipment: origEx.equipment,
          description: origEx.description,
          videoUrl: origEx.videoUrl,
          gifUrl: finalGifUrl
        }
      });
    } else {
      // Se foi deletado acidentalmente, reinsere com o ID correto
      await prisma.exercise.create({
        data: {
          id: origEx.id,
          name: origEx.name,
          muscleGroup: origEx.muscleGroup,
          equipment: origEx.equipment,
          description: origEx.description,
          videoUrl: origEx.videoUrl,
          gifUrl: finalGifUrl
        }
      });
    }
  }
  console.log("Biblioteca core original de 340 exercícios garantida e atualizada.");

  // 5. Inserir exercícios traduzidos não duplicados
  console.log("Iniciando importação dos exercícios traduzidos adicionais...");

  // Criar um Set dos nomes em inglês que foram mapeados/associados à biblioteca original
  const matchedEnglishNames = new Set(
    mappedGifs
      .map(mg => mg.matchedEnglishName ? mg.matchedEnglishName.toLowerCase() : null)
      .filter(Boolean)
  );

  // Também não podemos importar "3/4 sit-up" de novo porque já o renomeamos
  matchedEnglishNames.add("3/4 sit-up");

  let novosInseridos = 0;
  let duplicadosPulados = 0;

  for (let i = 0; i < rawExercises.length; i++) {
    const rawEx = rawExercises[i];
    const ptbrEx = ptbrExercises[i];

    const rawNameLower = rawEx.name.toLowerCase();

    // Se o exercício foi mapeado para a biblioteca original, pulamos para evitar duplicata
    if (matchedEnglishNames.has(rawNameLower)) {
      duplicadosPulados++;
      continue;
    }

    // Tenta encontrar por nome em português para evitar duplicar
    const normalizedNewName = ptbrEx.name.trim();
    const existingByName = await prisma.exercise.findUnique({
      where: { name: normalizedNewName }
    });

    if (!existingByName) {
      await prisma.exercise.create({
        data: {
          name: normalizedNewName,
          muscleGroup: ptbrEx.muscleGroup || 'Geral',
          equipment: ptbrEx.equipment || 'Peso Corporal',
          description: ptbrEx.description || null,
          gifUrl: ptbrEx.gifUrl || null,
          videoUrl: null
        }
      });
      novosInseridos++;
    }
  }

  const finalTotal = await prisma.exercise.count();
  console.log("\n=== CONCLUÍDO ===");
  console.log(`- Exercícios duplicados pulados (já representados na biblioteca original): ${duplicadosPulados}`);
  console.log(`- Novos exercícios traduzidos inseridos com sucesso: ${novosInseridos}`);
  console.log(`- Total de exercícios final no banco: ${finalTotal}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
