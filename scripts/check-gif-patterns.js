const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Check gifUrl patterns
  const exs = await prisma.exercise.findMany({
    where: { gifUrl: { not: null } },
    select: { gifUrl: true },
    take: 30
  });
  
  const patterns = {};
  exs.forEach(e => {
    const ext = e.gifUrl.split('.').pop();
    if (!patterns[ext]) patterns[ext] = 0;
    patterns[ext]++;
  });
  
  console.log('GIF URL extension distribution:', patterns);
  
  // Check any gifUrl that does NOT end with .gif
  const nonGifUrls = await prisma.exercise.findMany({
    where: { 
      gifUrl: { not: null },
      NOT: { gifUrl: { endsWith: '.gif' } }
    },
    select: { name: true, gifUrl: true },
    take: 10
  });
  
  console.log('\nExercises with gifUrl NOT ending in .gif:', nonGifUrls.length);
  nonGifUrls.forEach(e => console.log(`  - ${e.name}: ${e.gifUrl}`));
  
  // Total counts
  const total = await prisma.exercise.count();
  const withGif = await prisma.exercise.count({ where: { gifUrl: { not: null } } });
  const withVideo = await prisma.exercise.count({ where: { videoUrl: { not: null } } });
  const withBoth = await prisma.exercise.count({ where: { gifUrl: { not: null }, videoUrl: { not: null } } });
  
  console.log(`\nTotal exercises: ${total}`);
  console.log(`With gifUrl: ${withGif}`);
  console.log(`With videoUrl: ${withVideo}`);
  console.log(`With both: ${withBoth}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
