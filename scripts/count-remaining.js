const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countRemaining() {
  const all = await prisma.exercise.findMany({
    select: { id: true, name: true, description: true }
  });

  const enWords = [' with ', ' the ', ' and ', ' your ', ' feet ', ' knees ', ' hands ', ' hold ', ' stand ', ' lie ', ' keep ', ' repeat ', ' slowly ', ' chest ', ' floor ', ' starting '];
  const ptWords = [' com ', ' para ', ' os ', ' as ', ' em ', ' de ', ' do ', ' da ', ' pés ', ' joelhos ', ' mãos ', ' barra ', ' corpo ', ' tronco ', ' repetições '];

  const inEnglish = [];
  const inPortuguese = [];
  const noDesc = [];

  all.forEach(ex => {
    if (!ex.description || ex.description.trim().length === 0) {
      noDesc.push(ex);
      return;
    }
    const text = ' ' + ex.description.toLowerCase() + ' ';
    const enCount = enWords.filter(w => text.includes(w)).length;
    const ptCount = ptWords.filter(w => text.includes(w)).length;

    if (enCount > ptCount && enCount >= 2) {
      inEnglish.push(ex);
    } else {
      inPortuguese.push(ex);
    }
  });

  console.log("Total no banco:", all.length);
  console.log("Sem descrição:", noDesc.length);
  console.log("Em Português:", inPortuguese.length);
  console.log("Ainda em Inglês:", inEnglish.length);
}

countRemaining().catch(console.error).finally(() => prisma.$disconnect());
