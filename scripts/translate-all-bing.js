const { PrismaClient } = require('@prisma/client');
const { translate: bingTranslate } = require('bing-translate-api');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("=== TECHFITNESS - TRADUÇÃO COMPLETA DOS EXERCÍCIOS RESTANTES ===");

  const all = await prisma.exercise.findMany({
    select: { id: true, name: true, description: true }
  });

  const enWords = [' with ', ' the ', ' and ', ' your ', ' feet ', ' knees ', ' hands ', ' hold ', ' stand ', ' lie ', ' keep ', ' repeat ', ' slowly ', ' chest ', ' floor ', ' starting '];
  const ptWords = [' com ', ' para ', ' os ', ' as ', ' em ', ' de ', ' do ', ' da ', ' pés ', ' joelhos ', ' mãos ', ' barra ', ' corpo ', ' tronco ', ' repetições '];

  const pending = all.filter(ex => {
    if (!ex.description || ex.description.trim().length === 0) return false;
    const text = ' ' + ex.description.toLowerCase() + ' ';
    const enCount = enWords.filter(w => text.includes(w)).length;
    const ptCount = ptWords.filter(w => text.includes(w)).length;
    return enCount > ptCount && enCount >= 2;
  });

  console.log(`Total de exercícios encontrados no banco: ${all.length}`);
  console.log(`Exercícios pendentes de tradução (em inglês): ${pending.length}`);

  if (pending.length === 0) {
    console.log("🎉 Todos os exercícios já estão traduzidos!");
    return;
  }

  // Carregar arquivo de seed para manter sincronizado
  const seedPath = path.join(__dirname, '..', 'prisma', 'seeds', 'exercises_ptbr.json');
  let seedData = null;
  if (fs.existsSync(seedPath)) {
    seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  }

  // Agrupar dinamicamente em blocos respeitando o limite seguro de 900 caracteres do Bing
  const chunks = [];
  let currentChunk = [];
  let currentLen = 0;

  for (const item of pending) {
    const itemLen = item.description.length + 15; // margem para os delimitadores <<<N>>>
    if (currentLen + itemLen > 900 && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [item];
      currentLen = itemLen;
    } else {
      currentChunk.push(item);
      currentLen += itemLen;
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  console.log(`Organizado em ${chunks.length} lotes dinâmicos.`);

  let totalSuccess = 0;
  let totalFail = 0;
  const startTime = Date.now();

  for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
    const chunk = chunks[cIdx];
    let translatedParts = [];
    let ok = false;
    let retries = 0;

    while (!ok && retries < 4) {
      try {
        if (chunk.length === 1) {
          const res = await bingTranslate(chunk[0].description, 'en', 'pt');
          translatedParts = [res.translation.trim()];
          ok = true;
        } else {
          const joined = chunk.map((t, i) => `<<<${i}>>> ${t.description.replace(/\n+/g, ' ')}`).join('\n\n');
          const res = await bingTranslate(joined, 'en', 'pt');
          const parts = res.translation.split(/<<<\d+>>>/).map(s => s.trim()).filter(Boolean);

          if (parts.length === chunk.length) {
            translatedParts = parts;
            ok = true;
          } else {
            retries++;
            await new Promise(r => setTimeout(r, 800));
          }
        }
      } catch (err) {
        retries++;
        await new Promise(r => setTimeout(r, 1200 * retries));
      }
    }

    // Se falhou o lote mesmo com retries, traduzir individualmente
    if (!ok) {
      for (const item of chunk) {
        try {
          const single = await bingTranslate(item.description, 'en', 'pt');
          translatedParts.push(single.translation.trim());
          await new Promise(r => setTimeout(r, 200));
        } catch {
          translatedParts.push(null);
        }
      }
    }

    // Atualizar no banco e na memória do seed
    for (let j = 0; j < chunk.length; j++) {
      const ex = chunk[j];
      const translated = translatedParts[j];

      if (translated) {
        try {
          await prisma.exercise.update({
            where: { id: ex.id },
            data: { description: translated }
          });

          if (seedData) {
            const match = seedData.find(s => s.name.toLowerCase() === ex.name.toLowerCase() || s.description === ex.description);
            if (match) {
              match.description = translated;
            }
          }
          totalSuccess++;
        } catch {
          totalFail++;
        }
      } else {
        totalFail++;
      }
    }

    // A cada 20 lotes, salvar o arquivo de seed intermediário para garantir persistência
    if (seedData && (cIdx % 20 === 0 || cIdx === chunks.length - 1)) {
      fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2), 'utf8');
    }

    const processed = totalSuccess + totalFail;
    const pct = Math.round((processed / pending.length) * 100);
    console.log(`[Lote ${cIdx + 1}/${chunks.length}] (${pct}%) - Traduzidos: ${totalSuccess}/${pending.length} | Falhas: ${totalFail}`);

    // Pausa respeitosa de 200ms entre lotes
    await new Promise(r => setTimeout(r, 200));
  }

  // Salvar seed final
  if (seedData) {
    fs.writeFileSync(seedPath, JSON.stringify(seedData, null, 2), 'utf8');
    console.log("💾 Arquivo prisma/seeds/exercises_ptbr.json salvo e sincronizado!");
  }

  const durationMin = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n🎉 PROCESSO FINALIZADO EM ${durationMin} minutos!`);
  console.log(`Total traduzido com sucesso: ${totalSuccess}`);
  console.log(`Falhas: ${totalFail}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
