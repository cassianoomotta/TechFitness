import prisma from '../src/lib/prisma';

async function main() {
  console.log('\n--- TODOS OS LEG PRESS NO BANCO ---');
  const legPresses = await prisma.exercise.findMany({
    where: { 
      OR: [
        { name: { contains: 'leg', mode: 'insensitive' } },
        { name: { contains: 'press', mode: 'insensitive' } }
      ]
    }
  });
  legPresses.forEach(ex => {
    if (ex.name.toLowerCase().includes('leg')) {
      console.log(` - "${ex.name}" | GIF: ${ex.gifUrl} | ID: ${ex.id}`);
    }
  });
}

main().finally(() => prisma.$disconnect());
