const { PrismaClient } = require('@prisma/client');
const { translate } = require('@vitalets/google-translate-api');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("=== INICIANDO AUDITORIA E TRADUÇÃO COMPLETA DE EXERCÍCIOS ===");

  const all = await prisma.exercise.findMany({
    select: { id: true, name: true, description: true }
  });

  console.log(`Total de exercícios encontrados no banco: ${all.length}`);

  // Critério de identificação de inglês vs português
  const enWords = [' with ', ' the ', ' and ', ' your ', ' feet ', ' knees ', ' hands ', ' hold ', ' stand ', ' lie ', ' keep ', ' repeat ', ' slowly ', ' chest ', ' floor ', ' starting '];
  const ptWords = [' com ', ' para ', ' os ', ' as ', ' em ', ' de ', ' do ', ' da ', ' pés ', ' joelhos ', ' mãos ', ' barra ', ' corpo ', ' tronco ', ' repetições '];

  const toTranslate = [];

  all.forEach(ex => {
    if (!ex.description || ex.description.trim().length === 0) return;
    const text = ' ' + ex.description.toLowerCase() + ' ';
    const enCount = enWords.filter(w => text.includes(w)).length;
    const ptCount = ptWords.filter(w => text.includes(w)).length;

    // Se tiver mais indícios de inglês que português e pelo menos 2 palavras-chave em inglês
    if (enCount > ptCount && enCount >= 2) {
      toTranslate.push(ex);
    }
  });

  console.log(`Exercícios identificados com descrição em inglês: ${toTranslate.length}`);

  if (toTranslate.length === 0) {
    console.log("Nenhum exercício precisa de tradução!");
    return;
  }

  // 1. Criar backup de segurança das descrições antes da alteração
  const backupFile = path.join(__dirname, 'backup_descriptions_before_full_translation.json');
  fs.writeFileSync(backupFile, JSON.stringify(toTranslate.map(e => ({ id: e.id, name: e.name, description: e.description })), null, 2));
  console.log(`📁 Backup de segurança salvo em: ${backupFile}`);

  // 2. Carregar arquivo de seed para manter sincronizado
  const seedPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_ptbr.json');
  let seedData = null;
  if (fs.existsSync(seedPath)) {
    seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }

  // 3. Processar em lotes de 20 para evitar limites de taxa e otimizar tempo
  const CHUNK_SIZE = 20;
  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < toTranslate.length; i += CHUNK_SIZE) {
    const chunk = toTranslate.slice(i, i + CHUNK_SIZE);
    const progress = Math.round(((i + chunk.length) / toTranslate.length) * 100);

    let translatedParts = [];
    let retries = 0;
    let ok = false;

    while (!ok && retries < 3) {
      try {
        const combined = chunk.map((e, idx) => `@@@${idx}@@@ ${e.description.replace(/\n+/g, ' ')}`).join('\n\n');
        const res = await translate(combined, { to: 'pt' });
        const parts = res.text.split(/@@@\d+@@@/).map(s => s.trim()).filter(Boolean);

        if (parts.length === chunk.length) {
          translatedParts = parts;
          ok = true;
        } else {
          // Se o split falhou, traduzir individualmente como fallback
          retries++;
          if (retries >= 3) throw new Error("Fallback para individual");
          await new Promise(r => setTimeout(r, 600));
        }
      } catch (err) {
        retries++;
        await new Promise(r => setTimeout(r, 1000 * retries));
      }
    }

    // Se falhou o batch, traduzir item a item do chunk
    if (!ok) {
      for (const item of chunk) {
        try {
          const singleRes = await translate(item.description, { to: 'pt' });
          translatedParts.push(singleRes.text.trim());
          await new Promise(r => setTimeout(r, 200));
        } catch (e) {
          translatedParts.push(null);
        }
      }
    }

    // Atualizar no banco de dados e no arquivo de seeds
    for (let j = 0; j < chunk.length; j++) {
      const ex = chunk[j];
      const translatedDesc = translatedParts[j];

      if (translatedDesc) {
        try {
          await prisma.exercise.update({
            where: { id: ex.id },
            data: { description: translatedDesc }
          });

          // Atualizar no seed se existir correspondência de nome ou descrição anterior
          if (seedData) {
            const seedItem = seedData.find(s => s.name.toLowerCase() === ex.name.toLowerCase() || s.description === ex.description);
            if (seedItem) {
              seedItem.description = translatedDesc;
            }
          }

          successCount++;
        } catch (updateErr) {
          failCount++;
        }
      } else {
        failCount++;
      }
    }

    console.log(`[${i + chunk.length}/${toTranslate.length}] (${progress}%) - Sucesso: ${successCount} | Falhas: ${failCount}`);
    
    // Pequena pausa para respeitar a API de tradução
    await new Promise(r => setTimeout(r, 250));
  }

  // 4. Salvar arquivo de seeds atualizado
  if (seedData) {
    fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2), 'utf8');
    console.log("💾 Arquivo prisma/seeds/exercises_ptbr.json atualizado com as novas descrições!");
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n🎉 TRADUÇÃO CONCLUÍDA EM ${durationSec}s!`);
  console.log(`Total traduzido com sucesso: ${successCount}`);
  console.log(`Falhas: ${failCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
