import fs from 'fs';
import path from 'path';

const rawPath = path.join(process.cwd(), 'prisma', 'seeds', 'exercises_raw.json');
const rawData: any[] = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

console.log('--- BUSCANDO CANDIDATOS CORRETOS NO DATASET RAW ---\n');

// 1. Desenvolvimento máquina
console.log('=== 1. DESENVOLVIMENTO MÁQUINA / SHOULDER PRESS ===');
const shoulderPresses = rawData.filter(e => 
  (e.name.includes('shoulder press') || e.name.includes('overhead press')) &&
  (e.equipment?.includes('lever') || e.equipment?.includes('machine') || e.name.includes('lever') || e.name.includes('machine'))
);
shoulderPresses.forEach(e => {
  console.log(`[${e.id}] "${e.name}" | Equip: ${e.equipment} | GIF: ${e.gif_url}`);
});

// 2. Rosca unilateral na polia (Cable one arm / single arm bicep curl)
console.log('\n=== 2. ROSCA UNILATERAL NA POLIA / CABLE ONE ARM BICEP CURL ===');
const cableBiceps = rawData.filter(e => 
  (e.category === 'upper arms' || e.body_part === 'upper arms' || e.target === 'biceps') &&
  (e.equipment?.includes('cable') || e.name.includes('cable')) &&
  (e.name.includes('curl'))
);
cableBiceps.forEach(e => {
  console.log(`[${e.id}] "${e.name}" | Equip: ${e.equipment} | GIF: ${e.gif_url}`);
});

// 3. Cadeira Abdutora (Seated hip abduction machine)
console.log('\n=== 3. CADEIRA ABDUTORA / SEATED HIP ABDUCTION ===');
const hipAbductions = rawData.filter(e => 
  e.name.includes('hip abduction') || e.name.includes('abductor')
);
hipAbductions.forEach(e => {
  console.log(`[${e.id}] "${e.name}" | Equip: ${e.equipment} | GIF: ${e.gif_url}`);
});

// 4. Rosca direta na polia (Cable straight bar curl / two arm cable curl)
console.log('\n=== 4. ROSCA DIRETA NA POLIA BARRA RETA / CABLE BICEP CURL ===');
const straightBarCurls = cableBiceps.filter(e => 
  !e.name.includes('one arm') && !e.name.includes('single')
);
straightBarCurls.forEach(e => {
  console.log(`[${e.id}] "${e.name}" | Equip: ${e.equipment} | GIF: ${e.gif_url}`);
});

// 5. Leg Press 180 / Seated Horizontal Leg Press
console.log('\n=== 5. LEG PRESS 180 / SEATED HORIZONTAL LEG PRESS ===');
const legPresses = rawData.filter(e => 
  e.name.includes('leg press')
);
legPresses.forEach(e => {
  console.log(`[${e.id}] "${e.name}" | Equip: ${e.equipment} | GIF: ${e.gif_url}`);
});
