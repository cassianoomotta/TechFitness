import prisma from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('--- INICIANDO ATUALIZAÇÃO DOS 5 GIFS NO BANCO ---');

  // 1. Desenvolvimento na máquina articulada
  const ex1 = await prisma.exercise.updateMany({
    where: { name: { equals: 'Desenvolvimento na máquina articulada', mode: 'insensitive' } },
    data: { gifUrl: 'videos/0869-vqsbmL0.gif' }
  });
  console.log(`1. Desenvolvimento na máquina articulada atualizado: ${ex1.count} registro(s) -> videos/0869-vqsbmL0.gif`);

  // 2. Rosca unilateral na polia
  const ex2 = await prisma.exercise.updateMany({
    where: { name: { equals: 'Rosca unilateral na polia', mode: 'insensitive' } },
    data: { gifUrl: 'videos/0190-YTur5nR.gif' }
  });
  console.log(`2. Rosca unilateral na polia atualizado: ${ex2.count} registro(s) -> videos/0190-YTur5nR.gif`);

  // 3. Abdutora (Cadeira Abdutora)
  const ex3 = await prisma.exercise.updateMany({
    where: { name: { equals: 'Abdutora', mode: 'insensitive' } },
    data: { gifUrl: 'videos/0597-CHpahtl.gif' }
  });
  console.log(`3. Abdutora atualizado: ${ex3.count} registro(s) -> videos/0597-CHpahtl.gif`);

  // 4. Rosca direta na polia barra reta
  const ex4 = await prisma.exercise.updateMany({
    where: { name: { equals: 'Rosca direta na polia barra reta', mode: 'insensitive' } },
    data: { gifUrl: 'videos/0868-G08RZcQ.gif' }
  });
  console.log(`4. Rosca direta na polia barra reta atualizado: ${ex4.count} registro(s) -> videos/0868-G08RZcQ.gif`);

  // 5. Leg press 180
  // Atualizar variações de Leg 180 que apontavam para o trenó 45
  const ex5a = await prisma.exercise.updateMany({
    where: { name: { in: ['Leg 180 pés baixos', 'Leg 180 pés altos', 'Leg 180 unilateral'] } },
    data: { gifUrl: 'videos/2611-9KU9TYF.gif' }
  });
  console.log(`5a. Variações de Leg 180 atualizadas: ${ex5a.count} registro(s) -> videos/2611-9KU9TYF.gif`);

  // Garantir existência exata de "Leg press 180"
  const existingLeg180 = await prisma.exercise.findFirst({
    where: { name: { equals: 'Leg press 180', mode: 'insensitive' } }
  });

  if (existingLeg180) {
    await prisma.exercise.update({
      where: { id: existingLeg180.id },
      data: { gifUrl: 'videos/2611-9KU9TYF.gif' }
    });
    console.log('5b. "Leg press 180" já existia e teve o gifUrl atualizado para videos/2611-9KU9TYF.gif');
  } else {
    await prisma.exercise.create({
      data: {
        name: 'Leg press 180',
        muscleGroup: 'Pernas',
        equipment: 'Máquina',
        description: 'Ajuste o assento do leg press horizontal. Posicione os pés na plataforma na largura dos ombros. Empurre a plataforma estendendo os joelhos sem travá-los no final e retorne de forma controlada.',
        gifUrl: 'videos/2611-9KU9TYF.gif',
        videoUrl: null
      }
    });
    console.log('5b. "Leg press 180" criado com sucesso com gifUrl videos/2611-9KU9TYF.gif');
  }

  // Atualizar também nos arquivos de seed
  console.log('\n--- ATUALIZANDO ARQUIVOS DE SEED LOCAL ---');
  
  // 1. exercises_ptbr.json
  const ptbrPath = path.join(process.cwd(), 'prisma', 'seeds', 'exercises_ptbr.json');
  if (fs.existsSync(ptbrPath)) {
    const ptbrData = JSON.parse(fs.readFileSync(ptbrPath, 'utf8'));
    let ptbrUpdated = 0;
    for (const item of ptbrData) {
      if (item.name === 'Desenvolvimento na máquina articulada') {
        item.gifUrl = 'videos/0869-vqsbmL0.gif';
        ptbrUpdated++;
      }
    }
    fs.writeFileSync(ptbrPath, JSON.stringify(ptbrData, null, 2), 'utf8');
    console.log(`exercises_ptbr.json atualizado: ${ptbrUpdated} item(s)`);
  }

  // 2. mapped_core_gifs.json
  const mappedPath = path.join(process.cwd(), 'prisma', 'seeds', 'mapped_core_gifs.json');
  if (fs.existsSync(mappedPath)) {
    const mappedData = JSON.parse(fs.readFileSync(mappedPath, 'utf8'));
    let mappedUpdated = 0;
    for (const item of mappedData) {
      if (item.portugueseName === 'Rosca unilateral na polia') {
        item.gifUrl = 'videos/0190-YTur5nR.gif';
        item.matchedEnglishName = 'cable one arm curl';
        mappedUpdated++;
      }
      if (item.portugueseName === 'Rosca direta na polia barra reta') {
        item.gifUrl = 'videos/0868-G08RZcQ.gif';
        item.matchedEnglishName = 'cable curl';
        mappedUpdated++;
      }
    }
    fs.writeFileSync(mappedPath, JSON.stringify(mappedData, null, 2), 'utf8');
    console.log(`mapped_core_gifs.json atualizado: ${mappedUpdated} item(s)`);
  }

  console.log('\n--- ATUALIZAÇÃO CONCLUÍDA COM SUCESSO! ---');
}

main().finally(() => prisma.$disconnect());
