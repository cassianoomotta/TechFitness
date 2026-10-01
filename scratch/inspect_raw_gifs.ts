import fs from 'fs';
import path from 'path';

const rawPath = path.join(process.cwd(), 'prisma', 'seeds', 'exercises_raw.json');
console.log('Carregando exercises_raw.json...');
const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
console.log(`Carregados ${rawData.length} exercícios raw.`);

const gifsToCheck = [
  'videos/0603-67n3r98.gif', // Atual de "Desenvolvimento na máquina articulada"
  'videos/0868-G08RZcQ.gif', // Atual de "Rosca unilateral na polia"
  'videos/0710-7WaDzyL.gif', // Atual de "Abdutora"
  'videos/2462-LQFOrMn.gif', // Atual de "Rosca direta na polia barra reta"
  'videos/0739-10Z2DXU.gif', // Atual de "Leg press 180" / Leg 45
];

console.log('\n--- VERIFICANDO OS GIFS ATUAIS NO DATASET ORIGINAL ---');
for (const gif of gifsToCheck) {
  const match = rawData.find((e: any) => e.gif_url === gif);
  if (match) {
    console.log(`\nGIF: ${gif}`);
    console.log(` - ID: ${match.id} | Name: "${match.name}"`);
    console.log(` - Body Part: ${match.body_part} | Category: ${match.category} | Equipment: ${match.equipment}`);
    console.log(` - Instructions (EN): ${match.instructions?.en?.substring(0, 150)}...`);
  } else {
    console.log(`\nGIF: ${gif} - NÃO ENCONTRADO NO RAW!`);
  }
}
